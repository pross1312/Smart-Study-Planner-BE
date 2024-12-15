import {Router, Request, Response} from "express";
import { debugLog } from "../log/logger";
import {TodoController} from "../controller/todo.controller";

const router: Router = Router();

router.get("/", TodoController.list);
router.post("/", TodoController.add);

export default router;

