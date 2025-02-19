import AppError from '../exception/appError';
import {TodoModel, Todo} from "../model/todo.model";
import {TaskModel, TaskStatus, Task, TaskFilter} from "../model/task.model";
import {debugLog} from "../log/logger";
import {Validator} from "../utility/validator";

const TodoService = {
    async list(user_id: number, startDate: number | undefined, endDate: number | undefined) {
        if (Validator.isValue(startDate) && !Validator.isNumber(startDate)) {
            throw new AppError("Invalid startDate", 400);
        }
        if (Validator.isValue(endDate) && !Validator.isNumber(endDate)) {
            throw new AppError("Invalid endDate", 400);
        }
        const todos: Array<Todo> = await TodoModel.findBetween({user_id, start_date: startDate, end_date: endDate});

        // Include related task information
        const todosWithTasks = todos.map(async (todo) => {
            const taskDetails = await TaskModel.findOne({
                user_id,
                id: todo.task_id,
            }); 
            return {
                ...todo,
                task: taskDetails,
            };
        });

        return Promise.all(todosWithTasks); 
    },

    async add(user_id: number, taskId: number, startDate?: number) {
        debugLog(user_id, taskId, startDate);
        if (!Validator.isValue(taskId) || !Validator.isNumber(taskId)) {
            throw new AppError("Invalid or missing taskId in query", 400);
        }
        if (!Validator.isValue(startDate) || !Validator.isNumber(startDate)) {
            throw new AppError("Invalid or missing startDate in query", 400);
        }
        const task: Task | null = await TaskModel.findOne({user_id, id: Number(taskId)});
        if (task === null) {
            throw new AppError("taskId not found", 400);
        }

        const todo = new Todo({
            user_id,
            task_id: Number(taskId),
            start_date: startDate!,
            end_date: task.end_time ?? 0,
        });
        await TodoModel.save(todo);
        const now = new Date().getTime();
        if (now >= startDate!) {
            if (now >= todo.end_date) {
                await TaskModel.update({user_id, id: taskId}, {status: TaskStatus.Done});
            } else {
                await TaskModel.update({user_id, id: taskId}, {status: TaskStatus.InProgress});
            }
        }
    }
};

export {TodoService};
