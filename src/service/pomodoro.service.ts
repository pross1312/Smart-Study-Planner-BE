import {Validator} from "../utility/validator";
import {PomodoroHistoryModel, PomodoroHistory} from "../model/PomodoroHistory.model";
import {PomodoroSettingModel, PomodoroSetting} from "../model/PomodoroSetting.model";
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
        if (Number(startTime) + Number(span) >= Number(endTime)) throw new AppError("startTime + span must be equal or greater than endTime", 400);

        const newHistory = new PomodoroHistory({
            user_id: userId,
            start_time: Number(startTime),
            end_time: Number(endTime),
            span: Number(span)
        });
        await PomodoroHistoryModel.save(newHistory);
    },

    async getSetting(user_id: number): Promise<PomodoroSetting> {
        if (!Validator.isNumber(user_id, {start: 0})) throw new Error("Invalid userId from controller");
        let setting: PomodoroSetting | null = await PomodoroSettingModel.findOne({user_id});
        if (setting === null) {
            setting = new PomodoroSetting({ // create default setting
                user_id,
            });
            await PomodoroSettingModel.save(setting);
        }
        return setting;
    },

    async updateSetting({user_id, pomodoro_time, break_time, long_break_time}: {
        user_id: number,
        pomodoro_time: number | undefined,
        break_time: number | undefined,
        long_break_time: number | undefined,
    }) {
        if (!Validator.isNumber(user_id, {start: 0})) throw new Error("Invalid userId from controller");
        if (Validator.isValue(pomodoro_time) && !Validator.isNumber(pomodoro_time, {start: 0})) throw new AppError("Invalid pomodoroTime", 400);
        if (Validator.isValue(break_time) && !Validator.isNumber(break_time, {start: 0})) throw new AppError("Invalid breakTime", 400);
        if (Validator.isValue(long_break_time) && !Validator.isNumber(long_break_time, {start: 0})) throw new AppError("Invalid longBreakTime", 400);
        const rowCount = await PomodoroSettingModel.update(
            {user_id},
            {pomodoro_time, break_time, long_break_time}
        );
        if (rowCount == 0) { // insert a new one
            const newSetting = new PomodoroSetting({
                user_id,
                pomodoro_time: Validator.isNumber(pomodoro_time) ? Number(pomodoro_time) : undefined,
                break_time: Validator.isNumber(break_time) ? Number(break_time) : undefined,
                long_break_time: Validator.isNumber(long_break_time) ? Number(long_break_time) : undefined,
            })
            await PomodoroSettingModel.save(newSetting);
        }
    }
};

export {PomodoroService};
