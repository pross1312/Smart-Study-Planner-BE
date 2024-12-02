import { UserModel, User } from '../model/user.model'
import AppError from '../exception/appError';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const jwtExpired = process.env.JWT_EXPIRED || '3600';

class AuthService {
    async register(email: string, password: string): Promise<string> {
        const user: User | null = await UserModel.findOne({ email });
        if (user !== null) {
            throw new AppError("Email already exists", 400);
        }
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser: User = new User({ email, password: hashedPassword });
        await UserModel.save(newUser);
        return 'User registered successfully';
    }

    async login(email: string, password: string): Promise<{token: string, expired: string}> {
        const user: User | null = await UserModel.findOne({ email });
        if (!user || !user.password) {
            throw new AppError("User not found or password missing", 400);;
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid)
            throw new AppError("Password wrong", 400);
        const token = this.generateToken(user.email);

        return {
            token,
            expired: jwtExpired,
        };
    }

    async googleLogin(email: string): Promise<{token: string, expired: string}> {
        const token = this.generateToken(email);

        return {
            token,
            expired: jwtExpired,
        };
    }

    private generateToken = (userId: string) => {
        const payload = { userId };
        const options = { expiresIn: jwtExpired }; // 1h
        return jwt.sign(payload, process.env.JWT_SECRET || "UN", options);
    };
}

export default new AuthService();
