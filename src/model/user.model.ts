import {repo} from "../repository/postgreSQL"
import {debugLog} from "../log/logger";

type UserKey = "email" | "password" | "name" | "avatar";
class User {
    readonly id: number | undefined = undefined;
    email: string;
    password: string | null;
    name: string | null;
    avatar: string | null;
    constructor({email, password = null, name = null, avatar = null}: {
        email: string,
        password?: string | null,
        name?: string | null,
        avatar?: string | null
    }) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.avatar = avatar;
    }
}

export interface LeaderboardEntry {
    email: string,
    name: string,
    time_span: number, // minutes
    avatar: string
}

const UserModel = {
    save: async (user: User) => {
        const fields: Array<string> = Object.getOwnPropertyNames(user)
                                            .filter(prop => user[prop as keyof User] !== undefined  &&
                                                            user[prop as keyof User] !== null &&
                                                            typeof user[prop as keyof User] !== "function");
        const args: Array<string> = Array.from(fields, (field) => user[field as keyof User]!.toString());
        const params: string = Array.from({length: fields.length}, (_, index: number) => index).map(i => `$${i+1}`).join(", ");
        const query: string = `INSERT INTO "users"(${fields.join(", ")}) VALUES(${params})`;
        debugLog(query, args);
        await repo.exec("none", query, args);
    },

    find: async (info: {
        id?: number,
        email?: string,
        password?: string,
        name?: string,
        avatar?: string
    }): Promise<Array<User>> => {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<string> = Array.from(fields, (field) => info[field as keyof typeof info]!.toString());
        let query: string;
        if (fields.length > 0) {
            query = `SELECT * FROM "users" WHERE ${condition}`;
        } else {
            query = `SELECT * FROM "users"`;
        }
        debugLog(query, args);
        const users: Array<User> = await repo.exec("many", query, args);
        return users || [];
    },

    findOne: async (info: {
        id?: number,
        email?: string,
        password?: string,
        name?: string,
        avatar?: string
    }): Promise<User | null> => {
        const fields: Array<string> = Object.getOwnPropertyNames(info)
                                            .filter(prop => info[prop as keyof typeof info] !== undefined);
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(" AND ");
        const args: Array<string> = Array.from(fields, (field) => info[field as keyof typeof info]!.toString());

        let query: string;
        if (fields.length > 0) {
            query = `SELECT * FROM "users" WHERE ${condition}`;
        } else {
            query = `SELECT * FROM "users"`;
        }
        debugLog(query, args);
        const user: User | null = await repo.exec("oneOrNone", query, args);
        return user;
    },

    update: async (id: number, updatedFields: Partial<User>) => {
        const fields: Array<string> = Object.getOwnPropertyNames(updatedFields)
                                            .filter(prop => updatedFields[prop as keyof User] !== undefined &&
                                                            updatedFields[prop as keyof User] !== null);
        if (fields.length === 0) {
            throw new Error("No fields to update");
        }

        const setClause: string = fields.map((field, index) => `${field} = $${index+1}`).join(", ");
        const args: Array<string> = Array.from(fields, (field) => updatedFields[field as keyof User]!.toString());

        args.push(id.toString());

        const query: string = `UPDATE "users" SET ${setClause} WHERE id = $${fields.length + 1}`;
        debugLog(query, args);
        await repo.exec("none", query, args);
    },

    // page is 1-base index
    getLeaderboard: async (page: number, page_size: number): Promise<Array<LeaderboardEntry>> => {
        const query = "SELECT * from leaderboard($1, $2)";
        const args = [page-1, page_size]; // function leaderboard use 0-base index
        return await repo.exec("many", query, args) || [];
    }
};

export {UserModel, User};
