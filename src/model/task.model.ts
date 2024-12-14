import {repo} from "../repository/postgreSQL"
import {debugLog} from "../log/logger";
import TaskReq from '../exchange/req/task.req';

enum TaskStatus {
    Todo = "TODO",
    InProgress = "IN_PROGRESS",
    Done = "DONE",
}
enum TaskPriority {
    Low = "LOW",
    Medium = "MEDIUM",
    High = "HIGH",
}
class Task {
    readonly id: number | undefined;
    user_id: number;
    name: string;
    description: string | null;
    status: TaskStatus | null;
    priority: TaskPriority | null;
    estimate_time: number | null;
    is_deleted: boolean | null;

    constructor({user_id, name, description, status, priority, estimate_time, is_deleted}: {
        user_id: number;
        name: string;
        description?: string | null;
        status?: TaskStatus | null;
        priority?: TaskPriority | null;
        estimate_time?: number | null;
        is_deleted?: boolean | null;
    }) {
        this.user_id = user_id;
        this.name = name;
        this.description = description || "";
        this.status = status || TaskStatus.Todo;
        this.priority = priority || TaskPriority.Low;
        this.estimate_time = estimate_time || 3600;
        this.is_deleted = (is_deleted === undefined || is_deleted === null) ? false : is_deleted;
    }
}
const table_name = "task";
const TaskModel = {
    save: async (user: Task) => {
        const fields: Array<string> = Object.getOwnPropertyNames(user)
                                            .filter(prop => user[prop as keyof Task] !== null &&
                                                            typeof user[prop as keyof Task] !== "function");
        const args: Array<string> = Array.from(fields, (field) => user[field as keyof Task]!.toString());
        const params: string = Array.from({length: fields.length}, (_, index: number) => index).map(i => `$${i+1}`).join(", ");
        const query: string = `INSERT INTO "${table_name}"(${fields.join(", ")}) VALUES(${params})`;
        debugLog(query, params, args);
        await repo.exec("none", query, args);
    },

    find: async (info: {
        id?: number,
        user_id?: number,
        name?: string,
        description?: string,
        status?: TaskStatus,
        priority?: TaskPriority,
        estimate_time?: number,
        is_deleted?: boolean,
    }): Promise<Array<Task>> => {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(", ");
        const args: Array<string> = Array.from(fields, (field) => info[field as keyof typeof info]!.toString());
        let query: string;
        if (fields.length > 0) {
            query = `SELECT * FROM "${table_name}" WHERE ${condition}`;
        } else {
            query = `SELECT * FROM "${table_name}"`;
        }
        debugLog(query, args);
        const tasks: Array<Task> = await repo.exec("many", query, args);
        return tasks || [];
    },

    findOne: async (info: {
        id?: number,
        user_id?: number,
        name?: string,
        description?: string,
        status?: TaskStatus,
        priority?: TaskPriority,
        estimate_time?: number,
        is_deleted?: boolean,
    }): Promise<Task | null> => {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(", ");
        const args: Array<string> = Array.from(fields, (field) => info[field as keyof typeof info]!.toString());

        let query: string;
        if (fields.length > 0) {
            query = `SELECT * FROM "${table_name}" WHERE ${condition}`;
        } else {
            query = `SELECT * FROM "${table_name}"`;
        }
        debugLog(query, args);
        const Task: Task | null = await repo.exec("oneOrNone", query, args);
        return Task;
    },

    async getListTask(user_id: number, taskReq: TaskReq) {
        debugLog("GetListTask: Task request:", taskReq);
        const { startDate, endDate, priority, status, limit, offset } = taskReq;

        let args = [];
        let query = `SELECT * FROM task WHERE user_id = $1 AND is_deleted = false`;
        let count = 2;
        args.push(user_id);

        if (startDate) {
            query += ` AND created_date >= $${count++}`;
            args.push(startDate);
        }

        if (endDate) {
            query += ` AND created_date <= $${count++}`;
            args.push(endDate);
        }

        if (priority) {
            query += ` AND priority = $${count++}`;
            args.push(priority);
        }

        if (status) {
            query += ` AND status = $${count++}`;
            args.push(status);
        }

        query += ` ORDER BY updated_date desc LIMIT $${count++} OFFSET $${count++}`;
        args.push(limit, offset);
        debugLog(query, args);
        return await repo.exec("many", query, args) || [];
    }
};

export {TaskModel, Task, TaskStatus, TaskPriority};

