import { Request, Response, NextFunction } from 'express';
import { User } from "../model/user.model";
import { debugLog } from "../log/logger";
import { CONFIG } from "../config/common";
import authService from '../service/auth.service';
import successHandler from '../utility/ResponseSuccess';
import AppError from "../exception/appError";
import { UserService } from "../service/user.service";

class authController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            await authService.register(req.body.email, req.body.password);
            successHandler(res, "Ok");
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const {email, otp} = req.body;
            await authService.verifyEmail(email, otp);
            successHandler(res,  'User registered successfully');
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await authService.login(req.body.email, req.body.password)
            successHandler(res, response);
        } catch (error) {
            next(error)
        }
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        debugLog("Google logged in successfully.");
        try {
            if ('user' in req) {
                const response = await authService.googleLogin((req.user as User).id!)
                res.redirect(`${CONFIG.CLIENT_ADDR}/Smart-Study-Planner-FE/google/callback?token=${response.token}`);
            } else {
                throw new Error("Missing 'user' from passport, check passport configuration again.");
            }
        } catch (error) {
            next(error)
        }
    }

    async sendResetPasswordEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const {email} = req.params;
            await authService.sendResetPasswordEmail(email);
            successHandler(res, "Successfully send reset password link");
        } catch (err) {
            next(err);
        }
    }

    async sendResetPasswordPage(req: Request, res: Response, next: NextFunction) {
        try {
            const {token} = req.query;
            res.send(await authService.getResetPasswordPage(token));
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const {token, password} = req.body;
            await authService.resetPassword(token, password);
            successHandler(res, "Successfully reset password");
        } catch (err) {
            next(err);
        }
    }

    async getUserInfo(req: Request, res: Response, next: NextFunction) {
        try {
            const {userId} = req.params;
            const response = await UserService.get(+userId);
            successHandler(res, response);
        } catch (err) {
            next(err);
        }
    }

    async getLeaderboard(req: Request, res: Response, next: NextFunction) {
        try {
            const {page, page_size} = req.query;
            const result = await UserService.getLeaderboard(page, page_size);
            successHandler(res, result);
        } catch(error) {
            next(error);
        }
    }
}

export default new authController();
