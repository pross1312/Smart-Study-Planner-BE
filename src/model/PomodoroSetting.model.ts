import {Model} from "./model"

class PomodoroSetting {
    id?: number;
    user_id: number;
    pomodoro_time: number;
    break_time: number;
    long_break_time: number;
    constructor({user_id, pomodoro_time, break_time, long_break_time}: {
        user_id: number;
        pomodoro_time?: number;
        break_time?: number;
        long_break_time?: number;
    }) {
        this.user_id = user_id;
        this.pomodoro_time = pomodoro_time == undefined ? 25*60 : pomodoro_time;
        this.break_time = break_time == undefined ? 5*60 : break_time;
        this.long_break_time = long_break_time == undefined ? 15*60 : long_break_time;
    }

}
interface PomodoroSettingFilter {
    id?: number,
    user_id?: number,
    pomodoro_time?: number;
    break_time?: number;
    long_break_time?: number;
}

interface PomodoroSettingUpdate {
    pomodoro_time?: number;
    break_time?: number;
    long_break_time?: number;
}
const table_name = "pomodoro_setting";
class _PomodoroSettingModel extends Model<PomodoroSetting, PomodoroSettingFilter, PomodoroSettingUpdate> {
    constructor() {
        super(table_name);
    }
};

const PomodoroSettingModel = new _PomodoroSettingModel();
export {PomodoroSettingModel, PomodoroSetting, PomodoroSettingFilter, PomodoroSettingUpdate};
