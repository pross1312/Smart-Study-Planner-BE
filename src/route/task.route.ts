import {Router, Request, Response} from "express";
import { debugLog } from "../log/logger";
import {TaskController} from "../controller/task.controller";

const router: Router = Router();

router.get("/", TaskController.list);
router.get("/unassigned", TaskController.listUnassigned);
router.post("/", TaskController.add);
router.delete("/:taskId", TaskController.delete);
router.put("/:taskId", TaskController.update);
router.get("/report", TaskController.report)
router.get("/analytic", TaskController.analytic)

export default router;
