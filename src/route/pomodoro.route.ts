import {Router, Request, Response} from "express";
import { debugLog } from "../log/logger";
import {PomodoroController} from "../controller/pomodoro.controller";

const router: Router = Router();

router.get("/history", PomodoroController.listHistory);
router.post("/history", PomodoroController.addHistory);
router.get("/setting", PomodoroController.getSetting);
router.put("/setting", PomodoroController.updateSetting);
// router.delete("/:taskId", PomodoroController.deleteHistory);
// router.put("/:taskId", PomodoroController.updateHistory);

export default router;

