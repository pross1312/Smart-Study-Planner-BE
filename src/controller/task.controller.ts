import { Request, Response, NextFunction } from 'express';
import TaskReq from '../exchange/req/task.req';
import { Builder } from 'builder-pattern';
import {Task} from "../model/task.model";
import {User} from "../model/user.model";
import {TaskService} from "../service/task.service";
import successHandler from '../utility/ResponseSuccess';

const paginate = (page: number, size: number) => {
    const limit = size || 10;
    const offset = page > 0 ? (page - 1) * limit : 0;
    return { limit, offset };
};

const TaskController = {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const { startDate, endDate, priority, status, search } = req.query;
            const startDateNum = startDate ? new Date(startDate as string).getTime() : null;
            const endDateNum = endDate ? new Date(endDate as string).getTime()/*milis*/ + 3600*24*1000 : null;
            const { limit, offset } = paginate(page, size);
            const taskReq = Builder<TaskReq>()
                .limit(limit)
                .offset(offset)
                .startDate(startDateNum)
                .endDate(endDateNum)
                .priority(priority as string || null)
                .status(status as string || null)
                .search(search as string || null)
                .build();
            const data = await TaskService.list(user_id, taskReq);
            successHandler(res, data);
        } catch (err) {
            next(err);
        }
    },

    async listUnassigned(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const data = await TaskService.listUnassigned(user_id);
            successHandler(res, data);
        } catch (err) {
            next(err);
        }
    },

    async add(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            let { name, description, status, priority, start_time, end_time } = req.body;
            start_time = start_time == undefined ? undefined : Date.parse(start_time?.toString()!);
            end_time = end_time == undefined ? undefined : Date.parse(end_time?.toString()!);
            await TaskService.add({ user_id, name, description, status, priority, start_time, end_time });
            successHandler(res, "Create Task Successful");
        } catch(err) {
            next(err);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            let {name, description, status, priority, start_time, end_time, is_deleted} = req.body;
            start_time = start_time == undefined ? undefined : Date.parse(start_time?.toString()!);
            end_time = end_time == undefined ? undefined : Date.parse(end_time?.toString()!);
            const result = await TaskService.update(
                user_id,
                req.params.taskId,
                {name, description, status, priority, start_time, end_time, is_deleted}
            );
            successHandler(res, result);
        } catch(err) {
            next(err);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const result = await TaskService.delete(user_id, req.params.taskId);
            successHandler(res, result);
        } catch(err) {
            next(err);
        }
    },

    async report(req: Request, res: Response, next: NextFunction) {
        try {
            const startDate = Number(req.query.startDate);
            const endDate = Number(req.query.endDate);
            successHandler(res, await TaskService.report(startDate, endDate));
        } catch (err) {
            next(err);
        }
    },

    async analytic(req: Request, res: Response, next: NextFunction) {
        try {
            successHandler(res, await TaskService.analytic());
        } catch (err) {
            next(err);
        }
    }
};
export {TaskController};
