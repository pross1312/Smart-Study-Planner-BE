class PomodoroHistoryReq {
    limit: number;
    offset: number;
    startTime: number | null; // or Date if you want to use Date objects
    endTime: number | null;   // or Date

    constructor({limit, offset, startTime, endTime}: {
        limit: number,
        offset: number,
        startTime: number | null,
        endTime: number | null,
    }) {
        this.limit = limit;
        this.offset = offset;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
export {PomodoroHistoryReq};

