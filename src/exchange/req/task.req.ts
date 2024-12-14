class TaskReq {
    limit: number;
    offset: number;
    startDate: number | null; // or Date if you want to use Date objects
    endDate: number | null;   // or Date
    priority: string | null;
    status: string | null;

    constructor(
        limit: number,
        offset: number,
        startDate: number | null,
        endDate: number | null,
        priority: string | null,
        status: string | null,
    ) {
        this.limit = limit;
        this.offset = offset;
        this.startDate = startDate;
        this.endDate = endDate;
        this.priority = priority;
        this.status = status;
    }
}
export default TaskReq;