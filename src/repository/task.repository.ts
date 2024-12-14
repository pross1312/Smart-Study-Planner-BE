import {repo} from './postgreSQL'
import TaskReq from '../exchange/req/task.req';

class TaskRepository {    
    async getListTask(taskReq: TaskReq) {
        const { startDate, endDate, priority, status } = taskReq;

        let query = `SELECT * FROM task WHERE is_deleted = false`;

        if (startDate) {
            query += ` AND created_at >= ${startDate}`;
        }

        if (endDate) {
            query += ` AND created_at <= ${endDate}`;
        }

        if (priority) {
            query += ` AND priority = ${priority}`;
        }

        if (status) {
            query += ` AND status = ${status}`;
        }

        query += ` ORDER BY updated_date desc LIMIT ${taskReq.limit} OFFSET ${taskReq.offset}`;
        console.log(query)
        return await repo.exec("many", query, )
    }
}

export default new TaskRepository();