import { Request, Response, NextFunction } from 'express';
import {Task} from "../model/task.model";
import {User} from "../model/user.model";
import {TaskService} from "../service/task.service";
import successHandler from '../utility/ResponseSuccess';

const TaskController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const users: Array<Task> = await TaskService.list(user_id);
            successHandler(res, users);
        } catch (err) {
            next(err);
        }
    },

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const { name, description, status, priority, estimate_time } = req.body;
            await TaskService.add({ user_id, name, description, status, priority, estimate_time });
            successHandler(res, "Ok");
        } catch(err) {
            next(err);
        }
    }
};
export {TaskController};
