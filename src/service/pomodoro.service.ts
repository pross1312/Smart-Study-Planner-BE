import {Validator} from "../utility/validator";
import {PomodoroHistoryModel, PomodoroHistory} from "../model/PomodoroHistory.model";
import AppError from '../exception/appError';
import {PomodoroHistoryReq} from "../exchange/req/pomodoro.req";

const PomodoroService = {
    async listHistory({userId, limit, offset, startTime, endTime}: {
        userId: number,
        limit: number,
        offset: number,
        startTime: number | undefined,
        endTime: number | undefined
    }) {
        if (!Validator.isNumber(userId, {start: 0})) throw new Error("Invalid userId from controller");
        if (!Validator.isNumber(limit, {start: 0}))  throw new Error("Invalid limit from controller");
        if (!Validator.isNumber(offset, {start: 0}))  throw new Error("Invalid offset from controller");
        if (Validator.isValue(startTime) && !Validator.isNumber(startTime, {start: 0})) {
            throw new AppError("Invalid startTime", 400);
        }
        if (Validator.isValue(endTime) && !Validator.isNumber(endTime, {start: 0})) {
            throw new AppError("Invalid endTime", 400);
        }

        const req = new PomodoroHistoryReq({
            limit,
            offset,
            startTime: Validator.isValue(startTime) ? Number(startTime) : null,
            endTime: Validator.isValue(endTime) ? Number(endTime) : null,
        })

        const result = await PomodoroHistoryModel.listBetween(userId, req);
        return result;
    },

    async addHistory({userId, startTime, endTime, span}: {
        userId: number,
        startTime: number,
        endTime: number,
        span: number,
    }) {
        if (!Validator.isNumber(userId, {start: 0})) throw new Error("Invalid userId from controller");
        if (!Validator.isNumber(startTime, {start: 0})) throw new AppError("Invalid startTime", 400);
        if (!Validator.isNumber(endTime, {start: 0})) throw new AppError("Invalid endTime", 400);
        if (Number(startTime) > Number(endTime)) throw new AppError("startTime must be smaller than endTime", 400);
        if (!Validator.isNumber(span, {start: 0})) throw new AppError("Invalid span", 400);

        const newHistory = new PomodoroHistory({
            user_id: userId,
            start_time: Number(startTime),
            end_time: Number(endTime),
            span: Number(span)
        });
        await PomodoroHistoryModel.save(newHistory);
    }

};

export {PomodoroService};
