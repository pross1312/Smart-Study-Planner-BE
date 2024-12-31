import { Request, Response, NextFunction } from 'express';
import {PomodoroService} from "../service/pomodoro.service";
import successHandler from '../utility/ResponseSuccess';

const paginate = (page: number, size: number) => {
    const limit = size || 10;
    const offset = page > 0 ? (page - 1) * limit : 0;
    return { limit, offset };
};

const PomodoroController = {
    async listHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;
            const {startTime, endTime} = req.query;
            const { limit, offset } = paginate(page, size);
            const data = await PomodoroService.listHistory({
                userId: user_id,
                limit, offset,
                startTime: startTime == undefined ? undefined : Date.parse(startTime?.toString()!)/1000,
                endTime: endTime == undefined ? undefined : Date.parse(endTime?.toString()!)/1000,
            });
            successHandler(res, data);
        } catch(err) {
            next(err);
        }
    },

    async addHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const {startTime, endTime, span} = req.body;
            const data = await PomodoroService.addHistory({
                userId: user_id,
                startTime: Date.parse(startTime?.toString()!)/1000,
                endTime: Date.parse(endTime?.toString()!)/1000,
                span: Number(span)
            });
            successHandler(res, "Successfully added history");
        } catch(err) {
            next(err);
        }
    },

    async updateSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const {pomodoroTime, breakTime, longBreakTime} = req.body;
            await PomodoroService.updateSetting({
                user_id,
                pomodoro_time: pomodoroTime,
                break_time: breakTime,
                long_break_time: longBreakTime,
            });
            successHandler(res, "Successfully updated setting");
        } catch(err) {
            next(err);
        }
    },

    async getSetting(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const setting = await PomodoroService.getSetting(user_id);
            successHandler(res, setting);
        } catch(err) {
            next(err);
        }
    }
};
export {PomodoroController};

