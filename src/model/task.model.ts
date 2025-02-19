import {repo} from "../repository/postgreSQL"
import {debugLog} from "../log/logger";
import TaskReq from '../exchange/req/task.req';

enum TaskStatus {
    Todo = "TODO",
    InProgress = "IN_PROGRESS",
    Done = "DONE",
    Expired = "EXPIRED"
}
enum TaskPriority {
    Low = "LOW",
    Medium = "MEDIUM",
    High = "HIGH",
}
class Task {
    id?: number;
    user_id: number;
    name: string;
    description: string | null;
    status: TaskStatus | null;
    priority: TaskPriority | null;
    start_time: number | null;
    end_time: number | null;
    is_deleted: boolean | null;

    constructor({user_id, name, description, status, priority, start_time, end_time, is_deleted}: {
        user_id: number;
        name: string;
        description?: string | null;
        status?: TaskStatus | null;
        priority?: TaskPriority | null;
        start_time?: number | null;
        end_time?: number | null;
        is_deleted?: boolean | null;
    }) {
        this.user_id = user_id;
        this.name = name;
        this.description = description || "";
        this.status = status || TaskStatus.Todo;
        this.priority = priority || TaskPriority.Low;
        this.start_time = start_time  === undefined ? null : start_time;
        this.end_time = end_time  === undefined ? null : end_time;
        this.is_deleted = (is_deleted === undefined || is_deleted === null) ? false : is_deleted;
    }
}
const table_name = "task";
interface TaskFilter {
    id?: number,
    user_id?: number,
    name?: string,
    description?: string,
    status?: TaskStatus,
    priority?: TaskPriority,
    start_time?: number,
    end_time?: number,
    is_deleted?: boolean,
}
interface TaskUpdate {
    name?: string,
    description?: string,
    status?: TaskStatus,
    priority?: TaskPriority,
    start_time?: number,
    end_time?: number,
    is_deleted?: boolean,
}
const TaskModel = {
    save: async (task: Task) => {
        delete task.id; // use posgresql instead
        const fields: Array<string> = Object.getOwnPropertyNames(task)
                                            .filter(prop => task[prop as keyof Task] !== null &&
                                                            task[prop as keyof Task] !== undefined &&
                                                            typeof task[prop as keyof Task] !== "function");
        const args: Array<string> = Array.from(fields, (field) => task[field as keyof Task]!.toString());
        const params: string = Array.from({length: fields.length}, (_, index: number) => index).map(i => `$${i+1}`).join(", ");
        const query: string = `INSERT INTO "${table_name}"(${fields.join(", ")}) VALUES(${params})`;
        debugLog(query, args);
        await repo.exec("none", query, args);
    },

    find: async (info: TaskFilter): Promise<Array<Task>> => {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<any> = Array.from(fields, (field) => info[field as keyof typeof info]);
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

    findOne: async (info: TaskFilter): Promise<Task | null> => {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<any> = Array.from(fields, (field) => info[field as keyof typeof info]);

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

    async getUnassignedTasks(user_id: number) {
        const query = `SELECT * FROM "${table_name}" WHERE user_id = $1 AND start_time IS NULL AND end_time IS NULL`;
        debugLog(query, user_id);
        return await repo.exec("many", query, [user_id]) || [];
    },

    async getListTask(user_id: number, taskReq: TaskReq) {
        debugLog("GetListTask: Task request:", taskReq);
        const { startDate, endDate, priority, status, limit, offset, search, sort_by } = taskReq;

        let args = [];
        let query = `SELECT * FROM task WHERE user_id = $1 AND is_deleted = false`;
        let count = 2;
        args.push(user_id);

        if (startDate) {
            query += ` AND start_time >= $${count++}`;
            args.push(startDate);
        }

        if (endDate) {
            query += ` AND end_time <= $${count++}`;
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

        if (search) {
            query += ` AND name ilike $${count++}`;
            args.push( "%" + search.trim() + "%");
        }
        console.log(sort_by)

        if (sort_by) {
            query += ` ORDER BY ${sort_by.trim()}`;
        } else {
            query += ` ORDER BY updated_date desc`;
        }

        query += ` LIMIT $${count++} OFFSET $${count++}`;
        args.push(limit, offset);
        debugLog(query, args);
        return await repo.exec("many", query, args) || [];
    },

    async countListTask(user_id: number, taskReq: TaskReq) {
        debugLog("CountListTask: Task request:", taskReq);
        const { startDate, endDate, priority, status} = taskReq;

        let args = [];
        let query = `select COUNT(id) FROM task WHERE user_id = $1 AND is_deleted = false`;
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

        debugLog(query, args);
        return await repo.exec("one", query, args) || [];
    },

    async update(filter: TaskFilter, update: TaskUpdate): Promise<number> {
        const update_fields: Array<string> = Object.getOwnPropertyNames(update)
                                            .filter(prop => update[prop as keyof typeof update] !== undefined);
        if (update_fields.length == 0) {
            return 0;
        }
        let args_count = 1;
        const update_statement: string = update_fields.map((field, index) => `${field} = $${args_count++}`).join(", ");
        let args: Array<any> = Array.from(update_fields, (field) => update[field as keyof typeof update]);

        const filter_fields: Array<string> = Object.getOwnPropertyNames(filter)
                                            .filter(prop => filter[prop as keyof typeof filter] !== undefined);
        const filter_condition: string = filter_fields.map((field, index) => `${field} = $${args_count++}`).join(" AND ");
        args = args.concat(Array.from(filter_fields, (field) => filter[field as keyof typeof filter]));

        let query = `UPDATE "${table_name}" SET ${update_statement}, updated_date = (EXTRACT(EPOCH FROM now()) * 1000)`;
        if (filter_fields.length > 0) {
            query += ` WHERE ${filter_condition}`;
        }
        debugLog(query, args);
        const result = await repo.exec("result", query, args);
        debugLog(`Updated ${result.rowCount} from ${table_name}`);
        return result.rowCount;
    },

    async delete(filter: TaskFilter): Promise<number> {
        const fields: Array<string> = Object.getOwnPropertyNames(filter)
                                            .filter(prop => filter[prop as keyof typeof filter] !== undefined);
        if (fields.length == 0) {
            throw new Error("Attempt to delete without any condition");
        }
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<string> = Array.from(fields, (field) => filter[field as keyof typeof filter]!.toString());
        let query = `DELETE FROM ${table_name} WHERE ${condition}`;
        debugLog(query, args);

        const result = await repo.exec("result", query, args);
        console.log("Delete result: ", result);
        return result.rowCount;
    },

    async report(startDay: number, endDate: number, user_id: number) {
        let args_count = 1;
        let args = [];
        let query = `
        SELECT
            series.day,
            COUNT(task.id) AS record_count
        FROM
            generate_series(
                to_timestamp($${args_count++}), 
                to_timestamp($${args_count++}), 
                '1 day'::interval
            ) AS series(day)
        LEFT JOIN task ON to_timestamp(task.created_date)::date = series.day::date and user_id = $${args_count++}
        GROUP BY series.day
        ORDER BY series.day;
        `
        args.push(startDay, endDate, user_id);
        const result = await repo.exec("many", query, args)
        return result;
    },

    async analytic(user_id: number) {
        let args_count = 1;
        let args = [];
        let query = `
        SELECT
            task.status, COUNT(task.id) as quantity
        FROM
            task
        where user_id = $${args_count++}
        GROUP BY task.status
        `
        args.push(user_id)
        const result = await repo.exec("any", query, args)
        return result;
    },
    
};

export {TaskModel, Task, TaskStatus, TaskPriority, TaskUpdate, TaskFilter};

