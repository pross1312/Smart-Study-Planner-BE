import {debugLog} from "../log/logger";
import {repo} from "../repository/postgreSQL"

class Todo {
    id?: number;
    task_id: number;
    user_id: number;
    start_date: number;
    end_date: number;
    constructor({task_id, user_id, start_date, end_date}: {
        task_id: number;
        user_id: number;
        start_date: number;
        end_date: number
    }) {
        this.task_id = task_id;
        this.user_id = user_id;
        this.start_date = start_date;
        this.end_date = end_date;
    }
}
const table_name = "todo";
const TodoModel = {
    save: async (todo: Todo) => {
        delete todo.id; // use posgresql instead
        const fields: Array<string> = Object.getOwnPropertyNames(todo)
                                            .filter(prop => todo[prop as keyof Todo] !== null &&
                                                            todo[prop as keyof Todo] !== undefined &&
                                                            typeof todo[prop as keyof Todo] !== "function");
        const args: Array<string> = Array.from(fields, (field) => todo[field as keyof Todo]!.toString());
        const params: string = Array.from({length: fields.length}, (_, index: number) => index).map(i => `$${i+1}`).join(", ");
        const query: string = `INSERT INTO "${table_name}"(${fields.join(", ")}) VALUES(${params})`;
        debugLog(query, args);
        await repo.exec("none", query, args);
    },

    find: async (info: {
        id?: number;
        task_id?: number;
        user_id?: number;
        start_date?: number;
        end_date?: number;
    }): Promise<Array<Todo>> => {
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
        const todos: Array<Todo> = await repo.exec("many", query, args);
        return todos || [];
    },

    findOne: async (info: {
        id?: number;
        task_id?: number;
        user_id?: number;
        start_date?: number;
        end_date?: number;
    }): Promise<Todo | null> => {
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
        const todo: Todo | null = await repo.exec("oneOrNone", query, args);
        return todo;
    },

    findBetween: async (filter: {
        user_id: number,
        start_date?: number,
        end_date?: number,
    }): Promise<Array<Todo>> => {
        let query = `SELECT * FROM "${table_name}" WHERE user_id = $1`;
        let count = 2;
        let args = [filter.user_id];
        if (filter.start_date !== undefined) {
            query += ` AND start_date >= $${count++}`;
            args.push(filter.start_date);
        }
        if (filter.end_date !== undefined) {
            query += ` AND end_date <= $${count++}`;
            args.push(filter.end_date);
        }
        const todos: Array<Todo> = await repo.exec("many", query, args);
        return todos || [];
    }
};

export {TodoModel, Todo}
