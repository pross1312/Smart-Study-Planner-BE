import {Model} from "./model"
import {debugLog} from "../log/logger";
import {repo} from "../repository/postgreSQL"
import {PomodoroHistoryReq} from "../exchange/req/pomodoro.req";

class PomodoroHistory {
    id?: number;
    user_id: number;
    start_time: number;
    end_time: number;
    span: number;

    constructor({user_id, start_time, end_time, span}: {
        user_id: number,
        start_time: number,
        end_time: number,
        span: number
    }) {
        this.user_id = user_id;
        this.start_time = start_time;
        this.end_time = end_time;
        this.span = span;
    }
}

interface PomodoroHistoryFilter {
    id?: number,
    user_id?: number,
    start_time?: number;
    end_time?: number;
    span?: number;
}

interface PomodoroHistoryUpdate {
    start_time?: number;
    end_time?: number;
    span?: number;
}

const table_name = "pomodoro_history";
class _PomodoroHistoryModel extends Model<PomodoroHistory, PomodoroHistoryFilter, PomodoroHistory> {
    constructor() {
        super(table_name);
    }

    async listBetween(userId: number, req: PomodoroHistoryReq): Promise<Array<PomodoroHistory>> {
        let args = [];
        let query = `SELECT * FROM ${table_name} WHERE user_id = $1`;
        let count = 2;
        args.push(userId);
        if (req.startTime != null) {
            query += ` AND start_time >= $${count++}`;
            args.push(req.startTime);
        }
        if (req.endTime != null) {
            query += ` AND end_time <= $${count++}`;
            args.push(req.endTime);
        }
        query += ` ORDER BY start_time DESC LIMIT $${count++} OFFSET $${count++}`;
        args.push(req.limit, req.offset);
        debugLog(query, args);
        return await repo.exec("many", query, args) || [];
    }
};

const PomodoroHistoryModel = new _PomodoroHistoryModel();
export {PomodoroHistoryModel, PomodoroHistory, PomodoroHistoryFilter, PomodoroHistoryUpdate};
