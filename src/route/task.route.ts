import {Router, Request, Response} from "express";
import { debugLog } from "../log/logger";
import {TaskController} from "../controller/task.controller";

const router: Router = Router();

router.get("/", TaskController.list);
router.post("/", TaskController.add);

export default router;
