import { Request, Response, NextFunction } from 'express';
import authService from '../service/auth.service';
import successHandler from '../utility/ResponseSuccess';

class authController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await authService.register(req.body.username, req.body.password);
            successHandler(res, response);
        } catch (error) {
            next(error); 
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const response = await authService.login(req.body.username, req.body.password)
            successHandler(res, response);
        } catch (error) {
            next(error)
        }
    }
}

export default new authController();