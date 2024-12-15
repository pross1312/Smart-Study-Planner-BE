import AppError from '../exception/appError';
import {TodoModel, Todo} from "../model/todo.model";
import {TaskModel, TaskStatus, Task} from "../model/task.model";
import {debugLog} from "../log/logger";

const TodoService = {
    async list(user_id: number, startDate: number | undefined, endDate: number | undefined) {
        if (startDate !== undefined && isNaN(startDate)) {
            throw new AppError("Invalid startDate", 400);
        }
        if (endDate !== undefined && isNaN(endDate)) {
            throw new AppError("Invalid endDate", 400);
        }
        const todos: Array<Todo> = await TodoModel.findBetween({user_id, start_date: startDate, end_date: endDate});
        return todos;
    },

    async add(user_id: number, taskId?: number, startDate?: number) {
        debugLog(user_id, taskId, startDate);
        if (taskId === undefined || isNaN(taskId)) {
            throw new AppError("Invalid or missing taskId in query", 400);
        }
        if (startDate === undefined || isNaN(startDate)) {
            throw new AppError("Invalid or missing startDate in query", 400);
        }
        const task: Task | null = await TaskModel.findOne({user_id, id: taskId});
        if (task === null) {
            throw new AppError("taskId not found", 400);
        }

        const todo = new Todo({
            user_id,
            task_id: taskId,
            start_date: startDate,
            end_date: startDate + (task.estimate_time ?? 24*3600)*1000,
        });
        await TodoModel.save(todo);
        const now = new Date().getTime();
        if (now >= startDate) {
            if (now >= todo.end_date) {
                await TaskModel.update({user_id, id: taskId}, {status: TaskStatus.Done});
            } else {
                await TaskModel.update({user_id, id: taskId}, {status: TaskStatus.InProgress});
            }
        }
    }
};

export {TodoService};
