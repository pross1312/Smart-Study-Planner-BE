import TaskReq from "../exchange/req/task.req";
import {TaskModel, Task, TaskStatus, TaskPriority, TaskUpdate} from "../model/task.model";
import AppError from '../exception/appError';
import {Validator} from "../utility/validator";

const TaskService = {
    async list(user_id: number, taskReq: TaskReq) {
        taskReq.status = taskReq.status?.toString()?.toUpperCase() as string | null;
        taskReq.priority = taskReq.priority?.toString()?.toUpperCase() as string | null;

        if (Validator.isValue(taskReq.startDate) && !Validator.isNumber(taskReq.startDate)) {
            throw new AppError("Invalid startDate", 400);
        }
        if (Validator.isValue(taskReq.endDate) && !Validator.isNumber(taskReq.endDate)) {
            throw new AppError("Invalid endDate", 400);
        }
        if (Validator.isValue(taskReq.status) && !Validator.isEnum(taskReq.status, TaskStatus)) {
            throw new AppError(`Invalid TaskStatus ${taskReq.status}, must be one of ${Object.values(TaskStatus)}`, 400);
        }
        if (Validator.isValue(taskReq.priority) && !Validator.isEnum(taskReq.priority, TaskPriority)) {
            throw new AppError(`Invalid TaskPriority ${taskReq.priority}, must be one of ${Object.values(TaskPriority)}`, 400);
        }
        const tasks : Array<Task> = await TaskModel.getListTask(user_id, taskReq);
        const total : number= await TaskModel.countListTask(user_id, taskReq);
        const data = { tasks, total };
        return data as { tasks: Task[], total: number };
    },

    async listUnassigned(user_id: number) {
        if (!Validator.isNumber(user_id, {start: 0})) throw new Error("Invalid userId from controller");
        return await TaskModel.getUnassignedTasks(user_id);
    },

    async add({user_id, name, description, status, priority, start_time, end_time}: any): Promise<void> {
        status = status?.toString()?.toUpperCase();
        priority = priority?.toString()?.toUpperCase();
        if (!Validator.isValue(name)) {
            throw new AppError("Missing name when adding new task", 400);
        }
        if (Validator.isValue(status) && !Validator.isEnum(status, TaskStatus)) {
            throw new AppError(`Invalid TaskStatus ${status}, must be one of ${Object.values(TaskStatus)}`, 400);
        }
        if (Validator.isValue(priority) && !Validator.isEnum(priority, TaskPriority)) {
            throw new AppError(`Invalid TaskPriority ${priority}, must be one of ${Object.values(TaskPriority)}`, 400);
        }
        if ((Validator.isValue(start_time) && !Validator.isValue(end_time)) ||
            (Validator.isValue(end_time) && !Validator.isValue(start_time))) {
            throw new AppError("Must specify both start_time and end_time or none at all", 400);
        }
        if (Validator.isValue(start_time) && !Validator.isNumber(start_time)) {
            throw new AppError(`Invalid start_time, must be a positive number`, 400);
        }
        if (Validator.isValue(end_time) && !Validator.isNumber(end_time, {start: start_time})) {
            throw new AppError(`Invalid end_time, must be a positive number and bigger than start_time`, 400);
        }
        if (Validator.isValue(start_time) && !Validator.isValue(status)) {
            const currentTime = new Date().getTime()/1000; // seconds
            if (currentTime < start_time) status = TaskStatus.Todo;
            else if (currentTime >= end_time) status = TaskStatus.Expired;
            else status = TaskStatus.InProgress;
        }
        await TaskModel.save(new Task({
            user_id: user_id,
            name, status, description, priority, start_time, end_time
        }));
    },

    async update(userId: number, taskId: string, updates: TaskUpdate): Promise<number> {
        if (!Validator.isNumber(taskId, {start: 0})) {
            throw new AppError(`Invalid taskId ${taskId}, must be a positive number`, 400);
        }
        if (Validator.isValue(updates.status) && !Validator.isEnum(updates.status, TaskStatus)) {
            throw new AppError(`Invalid TaskStatus ${updates.status}, must be one of ${Object.values(TaskStatus)}`, 400);
        }
        if (Validator.isValue(updates.priority) && !Validator.isEnum(updates.priority, TaskPriority)) {
            throw new AppError(`Invalid TaskPriority ${updates.priority}, must be one of ${Object.values(TaskPriority)}`, 400);
        }
        if (Validator.isValue(updates.is_deleted) && Validator.parseBoolean(updates.is_deleted) === null) {
            throw new AppError(`Invalid is_deleted, must be a boolean`, 400);
        }

        const oldTask = await TaskModel.findOne({id: Number(taskId)});
        const end = Validator.isValue(updates.end_time) && Validator.isNumber(updates.end_time) ?
                                                            updates.end_time : oldTask?.end_time;
        if (Validator.isValue(updates.start_time) && !Validator.isNumber(updates.start_time, {end})) {
            throw new AppError(`Invalid start_time, must be a positive number and smaller than end_time (old|new)`, 400);
        }

        const start = Validator.isValue(updates.start_time) && Validator.isNumber(updates.start_time) ?
                                                            updates.start_time : oldTask?.start_time;
        if (Validator.isValue(updates.end_time) && !Validator.isNumber(updates.end_time, {start})) {
            throw new AppError(`Invalid end_time, must be a positive number and bigger than start_time (old|new)`, 400);
        }
        if (!Validator.isValue(updates.status)) {
            const currentTime = new Date().getTime()/1000; // seconds
            if (Validator.isNumber(start) && currentTime < start!) updates.status = TaskStatus.Todo;
            else if (Validator.isNumber(end) && currentTime >= end!) updates.status = TaskStatus.Expired;
            else if (Validator.isNumber(start) && Validator.isNumber(end)) updates.status = TaskStatus.InProgress;
            else updates.status = TaskStatus.Todo;
        }
        const rowUpdated = await TaskModel.update({user_id: userId, id: Number(taskId)}, updates);
        return rowUpdated;
    },

    async delete(userId: number, taskId: string): Promise<number> {
        if (!Validator.isNumber(taskId, {start: 0})) {
            throw new AppError(`Invalid taskId ${taskId}, must be a positive number`, 400);
        }
        const rowDeleted = await TaskModel.delete({user_id: userId, id: Number(taskId)});
        return rowDeleted;
    },

    async report(startDay: number, endDate: number, user_id: number) {
        if (!startDay || !endDate) {
            throw new AppError(`startday or enday is not valid`, 400);
        }
        if (startDay > endDate) {
            throw new AppError(`startday greater than enday`, 400);
        }
        return await TaskModel.report(startDay, endDate, user_id);
    },

    async analytic(user_id: number) {
        return await TaskModel.analytic(user_id);
    }
};

export {TaskService};
