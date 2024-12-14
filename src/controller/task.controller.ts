import { Request, Response, NextFunction } from 'express';
import TaskReq from '../exchange/req/task.req';
import { Builder } from 'builder-pattern';
import TaskRepository from '../repository/task.repository'
import SuccessHandler from '../utility/ResponseSuccess';
import AppError from '../exception/appError';

const paginate = (page: number, size: number) => {
    const limit = size || 10;
    const offset = page > 0 ? (page - 1) * limit : 0;
    return { limit, offset };
};

class taskController {
    async getListTask(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const { startDate, endDate, priority, status, idUser } = req.query;
            const startDateNum = startDate ? new Date(startDate as string).getTime() : null;
            const endDateNum = endDate ? new Date(endDate as string).getTime() : null;
            const { limit, offset } = paginate(page, size);
            if (!idUser) throw new AppError("User not found or missing", 400);
            const taskReq = Builder<TaskReq>()
                .limit(limit)
                .offset(offset)
                .startDate(startDateNum)
                .endDate(endDateNum)
                .priority(priority as string || null)
                .status(status as string || null)
                .build();
            const response = await TaskRepository.getListTask(taskReq);
            SuccessHandler(res, response);
        } catch (error) {
            next(error)
        }
    }
}

export default new taskController();
