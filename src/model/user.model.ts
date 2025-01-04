import {repo} from "../repository/postgreSQL"
import {debugLog} from "../log/logger";
import {Model} from "./model"

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

const table_name = "users";
interface UserFilter {
    id?: number;
    email?: string;
    name?: string;
}
interface UserUpdate {
    password?: string;
    name?: string;
    avatar?: string;
}
class _UserModel extends Model<User, UserFilter, Partial<User>> {
    constructor() {
        super(table_name);
    }

    async getLeaderboard(page: number, page_size: number): Promise<Array<LeaderboardEntry>> {
        const query = "SELECT * from leaderboard($1, $2)";
        const args = [page-1, page_size]; // function leaderboard use 0-base index
        return await repo.exec("many", query, args) || [];
    }
}
const UserModel = new _UserModel();

export {UserModel, User};
