import { Request, Response, NextFunction } from 'express';
import { User } from "../model/user.model";
import { debugLog } from "../log/logger";
import { CLIENT_ADDR } from "../config/common";
import authService from '../service/auth.service';
import successHandler from '../utility/ResponseSuccess';

class authController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await authService.register(req.body.email, req.body.password);
            successHandler(res, response);
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
                const response = await authService.googleLogin((req.user as User).email)
                res.redirect(`${CLIENT_ADDR}/google/callback?token=${response.token}`);
            } else {
                throw new Error("Missing 'user' from passport, check passport configuration again.");
            }
        } catch (error) {
            next(error)
        }
    }
}

export default new authController();
