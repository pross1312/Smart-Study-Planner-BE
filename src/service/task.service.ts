import {TaskModel, Task, TaskStatus, TaskPriority} from "../model/task.model";
import AppError from '../exception/appError';

function is_valid_enum(value: string, enumObject: any): boolean {
    return Object.values(enumObject).includes(value);
}

const TaskService = {
    async list(user_id: number): Promise<Array<Task>> {
        return await TaskModel.find({user_id});
    },

    async add({user_id, name, description, status, priority, estimate_time}: any): Promise<void> {
        status = status?.toString()?.toUpperCase();
        priority = priority?.toString()?.toUpperCase();
        if (status && !is_valid_enum(status, TaskStatus)) {
            throw new AppError(`Invalid TaskStatus ${status}, must be one of ${Object.values(TaskStatus)}`, 400);
        }
        if (priority && !is_valid_enum(priority, TaskPriority)) {
            throw new AppError(`Invalid TaskPriority ${priority}, must be one of ${Object.values(TaskPriority)}`, 400);
        }
        if (estimate_time && (isNaN(Number(estimate_time)) || Number(estimate_time) < 0)) {
            throw new AppError(`Invalid estimate_time ${estimate_time}, must be a positive number`, 400);
        }
        await TaskModel.save(new Task({
            user_id: user_id,
            name, status, description, priority, estimate_time
        }));
    }
};

export {TaskService};
