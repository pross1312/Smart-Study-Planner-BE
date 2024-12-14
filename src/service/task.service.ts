import TaskReq from "../exchange/req/task.req";
import TaskRepository from "../repository/task.repository";
class TaskService {
    async getListTask(taskReq: TaskReq) {
        const response = await TaskRepository.getListTask(taskReq);
        return response == null ? [] : response;  
    }
}

export default new TaskService();