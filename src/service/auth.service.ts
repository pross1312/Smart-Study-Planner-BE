import { UserModel, User } from '../model/user.model'
import AppError from '../exception/appError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {Validator} from "../utility/validator";
import {Mailer, SendMailResult} from "../utility/mailer";
import {debugLog} from "../log/logger";

const jwtExpired = process.env.JWT_EXPIRED || '1h';

const otpLength = 6;
const otpExpireTime = 10 // minutes
const otpCleanUpTime = 30; // minutes

const registeringEmails: {[key: string]: {password: string, otp: string, expired: boolean, timeOut: NodeJS.Timeout}} = {
};

class AuthService {
    async register(email: string, password: string) {
        if (!Validator.isEmail(email)) {
            throw new AppError("Invalid email", 400);
        }
        if (!Validator.isValue(password)) {
            throw new AppError("Missing password", 400);
        }
        const user: User | null = await UserModel.findOne({ email });
        if (user !== null) {
            throw new AppError("Email already exists", 400);
        }
        if (email in registeringEmails) {
            const {timeOut} = registeringEmails[email];
            clearTimeout(timeOut);
        }
        const otp = this.generateOtp(email);
        registeringEmails[email] = {
            password,
            otp,
            expired: false,
            timeOut: setTimeout(() => {
                if (email in registeringEmails) {
                    registeringEmails[email].expired = true;
                    registeringEmails[email].timeOut = setTimeout(() => {
                        if (email in registeringEmails) {
                            delete registeringEmails[email];
                        }
                    }, otpCleanUpTime * 60 * 1000);
                }
            }, otpExpireTime * 60 * 1000)
        };
        await this.sendOtp(email, otp);
    }

    async verifyEmail(email: any, _otp: any) {
        if (!Validator.isNumberSequence(_otp, otpLength)) throw new AppError("Invalid OTP", 400);
        if (!Validator.isEmail(email) || !(email in registeringEmails)) throw new AppError("Invalid email", 400);

        const {password, otp, expired, timeOut} = registeringEmails[email];
        if (otp !== _otp) throw new AppError("Incorrect OTP", 400);

        clearTimeout(timeOut);
        delete registeringEmails[email];
        if (expired) throw new AppError("OTP Expired", 400);

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser: User = new User({ email, password: hashedPassword });
        await UserModel.save(newUser);
    }

    async login(email: string, password: string): Promise<{token: string, expired: string}> {
        const user: User | null = await UserModel.findOne({ email });
        if (!user || !user.password) {
            throw new AppError("User not found or password missing", 400);;
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid)
            throw new AppError("Password wrong", 400);
        const token = this.generateToken(user.id!);

        return {
            token,
            expired: jwtExpired,
        };
    }

    async googleLogin(user_id: number): Promise<{token: string, expired: string}> {
        const token = this.generateToken(user_id);

        return {
            token,
            expired: jwtExpired,
        };
    }

    private generateToken = (userId: number) => {
        const payload = { userId };
        const options = { expiresIn: jwtExpired }; // 1h
        return jwt.sign(payload, process.env.JWT_SECRET || "UN", options);
    };

    private generateOtp(email: string): string {
        const getRandomInt = (min: number, max: number): number => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        return Array.from({ length: otpLength }, (_, i) => getRandomInt(0, 9)).join("");
    }

    private async sendOtp(email: string, otp: string) {
        const result = await Mailer.send(email, "Verify your email for SmartStudyPlanner", `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f7fc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 28px;
            color: #007bff;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #333;
            margin: 20px 0;
        }
        .content {
            font-size: 16px;
            color: #555;
            line-height: 1.6;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            padding-top: 20px;
        }
        .button {
            display: block;
            width: 100%;
            padding: 12px;
            background-color: #007bff;
            color: white;
            text-align: center;
            font-size: 16px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>

    <div class="container">
        <div class="header">
            <h1>OTP Verification</h1>
        </div>

        <div class="content">
            <p>Dear User,</p>
            <p>We received a request register you account on SmartStudyPlanner. Please use the OTP below to complete your verification process:</p>

            <div class="otp">
                ${otp}
            </div>

            <p>This OTP is valid for the next ${otpExpireTime} minutes. If you did not request this verification, please ignore this email.</p>

            <p>Best regards,</p>
            <p>The SmartStudyPlanner Team</p>
        </div>

        <div class="footer">
            <p>If you have any questions, feel free to contact us at <a href="mailto:smartstudyplanner25@gmail.com">smartstudyplanner25@gmail.com</a>.</p>
        </div>
    </div>

</body>
</html>
`);
    }
}

export default new AuthService();
