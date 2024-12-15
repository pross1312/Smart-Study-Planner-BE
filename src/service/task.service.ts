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

    async add({user_id, name, description, status, priority, estimate_time}: any): Promise<void> {
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
        if (Validator.isValue(estimate_time) && !Validator.isNumber(estimate_time, {start: 0})) {
            throw new AppError(`Invalid estimate_time ${estimate_time}, must be a positive number`, 400);
        }
        await TaskModel.save(new Task({
            user_id: user_id,
            name, status, description, priority, estimate_time
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
        if (Validator.isValue(updates.estimate_time) && !Validator.isNumber(updates.estimate_time, {start: 0})) {
            throw new AppError(`Invalid estimate_time ${updates.estimate_time}, must be a positive number`, 400);
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
    }
};

export {TaskService};
