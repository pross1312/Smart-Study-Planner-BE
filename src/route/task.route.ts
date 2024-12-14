import {Router, Request, Response} from "express";
import taskController from "../controller/task.controller";

const router: Router = Router();
router.get("", taskController.getListTask);

export default router;

