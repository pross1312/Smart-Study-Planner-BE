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
const UserModel = {
    save: async (user: User) => {
        const fields: Array<string> = Object.getOwnPropertyNames(user)
                                            .filter(prop => user[prop as keyof User] !== undefined  &&
                                                            user[prop as keyof User] !== null &&
                                                            typeof user[prop as keyof User] !== "function");
        const args: Array<string> = Array.from(fields, (field) => user[field as keyof User]!.toString());
        const params: string = Array.from({length: fields.length}, (_, index: number) => index).map(i => `$${i+1}`).join(", ");
        const query: string = `INSERT INTO "users"(${fields.join(", ")}) VALUES(${params})`;
        debugLog(query, params, args);
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
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(", ");
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
        const condition: string = fields.map((field, index) => `${field} = $${index+1}`).join(", ");
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
    }
};

export {UserModel, User};
