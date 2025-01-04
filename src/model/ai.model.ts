import {Model} from "./model";

export enum Role {
    Model = "model",
    User = "user",
}

class AIHistory {
    id?: number;
    user_id: number;
    created_date?: number;
    role: Role;
    content: string;
    constructor({user_id, role, content}: {
        user_id: number;
        role: Role;
        content: string;
    }) {
        this.user_id = user_id;
        this.role = role;
        this.content = content;
    }
}

interface AIHistoryFilter {
    id?: number;
    user_id?: number;
}
interface AIHistoryUpdate {
    created_date?: number;
    role?: Role,
    content?: string,
}
const table_name = "ai_history";
class _AIHisotryModel extends Model<AIHistory, AIHistoryFilter, AIHistoryUpdate> {
    constructor() {
        super(table_name);
    }
}
const AIHistoryModel = new _AIHisotryModel();
export {AIHistory, AIHistoryFilter, AIHistoryUpdate, AIHistoryModel};
