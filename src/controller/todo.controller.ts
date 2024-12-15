import { Request, Response, NextFunction } from 'express';
import {TodoService} from "../service/todo.service";
import successHandler from '../utility/ResponseSuccess';

const TodoController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const startDate = req.query.startDate ? new Date(req.query.startDate as string).getTime() : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate as string).getTime() : undefined;
            const result = await TodoService.list(user_id, startDate, endDate);
            successHandler(res, result);
        } catch(error) {
            next(error);
        }
    },

    //NOTE: end_date will be calculated using startDate and estimate_time of the task
    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const taskId = Number(req.body.taskId);
            const startDate = req.body.startDate ? new Date(req.body.startDate as string).getTime() : undefined;
            await TodoService.add(user_id, taskId, startDate);
            successHandler(res, "Ok");
        } catch(err) {
            next(err);
        }
    }
};

export {TodoController};
