import { UserModel, User } from '../model/user.model'
import AppError from '../exception/appError';
import bcrypt from 'bcrypt';
import jwt, {VerifyCallback, TokenExpiredError} from 'jsonwebtoken';
import {Validator} from "../utility/validator";
import {Mailer, SendMailResult} from "../utility/mailer";
import {debugLog} from "../log/logger";
import otpEmail from "../html/otp-email.html";
import resetPasswordEmail from "../html/reset-password-email.html";
import resetPasswordPage from "../html/reset-password.html";

const jwtExpired = process.env.JWT_EXPIRED || '1h';

const otpLength = 6;
const otpExpireTime = 10 // minutes
const otpCleanUpTime = 30; // minutes

const resetPasswordLink = "http://localhost:3000/auth/password/reset-page";
const resetPasswordJwtSecret = process.env.RESET_PASSWORD_JWT_SECRET || "UN";
const resetPasswordExpireTime = process.env.RESET_PASSWORD_EXPIRE_TIME || "15m";

const requireEmailVerification = true;

const registeringEmails: {[key: string]: {password: string, otp: string, expired: boolean, timeOut: NodeJS.Timeout}} = {
};

interface ResetPasswordTokenPayload {
    email: string,
    createdTime: number,
}

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

        if (requireEmailVerification) {
            await this.sendOtp(email, otp);
        } else {
            await this.verifyEmail(email, otp);
        }
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

    private replaceAll(str: string, mapObj: {[key: string]: string}): string {
        const escapeRegExp = (str: string) => {
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        };
        var re = new RegExp(Object.keys(mapObj).map(x => escapeRegExp(x)).join("|"),"gi");
        return str.replace(re, function(matched){
            return mapObj[matched];
        });
    }

    private async sendOtp(email: string, otp: string) {
        const html = this.replaceAll(otpEmail, {
            "${OTP}": otp,
            "${OTP_EXPIRE_TIME}": otpExpireTime.toString(),
        });
        const result = await Mailer.send(email, "Verify your email for SmartStudyPlanner", html);
    }

    async sendResetPasswordEmail(email: any) {
        if (!Validator.isEmail(email)) throw new AppError("Invalid email", 400);
        const payload: ResetPasswordTokenPayload = { email, createdTime: new Date().getTime() };
        const options = { expiresIn: resetPasswordExpireTime };
        const token = jwt.sign(payload, resetPasswordJwtSecret, options);
        const resetPasswordUri = encodeURI(`${resetPasswordLink}?token=${token}`);
        const html = this.replaceAll(resetPasswordEmail, {
            "${RESET_PASSWORD_URI}": resetPasswordUri,
            "${RESET_PASSWORD_EXPIRE_TIME}": resetPasswordExpireTime
        });
        const result = await Mailer.send(email, "Reset your password for SmartStudyPlanner", html);
    }

    async getResetPasswordPage(token: any): Promise<string> {
        if (!Validator.isValue(token)) throw new AppError("Missing reset password token", 400);
        return new Promise((resolve, reject) => {
            jwt.verify(token, resetPasswordJwtSecret, (async (err, decoded) => {
                if (err) {
                    console.log(err);
                    if (err instanceof TokenExpiredError) {
                        reject(new AppError("Token expired", 400));
                    } else {
                        reject(new AppError("Invalid reset password token", 400));
                    }
                } else {
                    const {email, createdTime} = decoded as ResetPasswordTokenPayload;
                    const html = this.replaceAll(resetPasswordPage, {"${TOKEN}": token});
                    resolve(html);
                }
            }) as VerifyCallback);
        });
    }

    async resetPassword(token: any, password: string) {
        if (!Validator.isValue(token)) throw new AppError("Missing reset password token", 400);
        if (!Validator.isValue(password)) throw new AppError("Missing password token", 400);
        return new Promise<void>((resolve, reject) => {
            jwt.verify(token, resetPasswordJwtSecret, (async (err, decoded) => {
                if (err) {
                    console.log(err);
                    if (err instanceof TokenExpiredError) {
                        reject(new AppError("Token expired", 400));
                    } else {
                        reject(new AppError("Invalid reset password token", 400));
                    }
                } else {
                    const {email, createdTime} = decoded as ResetPasswordTokenPayload;
                    const hashedPassword = bcrypt.hashSync(password, 10);
                    await UserModel.update({email}, {password: hashedPassword});
                    resolve();
                }
            }) as VerifyCallback);
        });
    }
}

export default new AuthService();
