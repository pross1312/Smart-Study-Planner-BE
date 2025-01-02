import { Request, Response, NextFunction } from 'express';
import {UserService} from "../service/user.service";
import successHandler from '../utility/ResponseSuccess';

const UserController = {
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const response = await UserService.update(req.body, req.files?.avatar, user_id);
            successHandler(res, response);
        } catch(error) {
            next(error);
        }
    },
    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            successHandler(res, await UserService.get(user_id));
        } catch(error) {
            next(error);
        }
    },
};

export {UserController};
