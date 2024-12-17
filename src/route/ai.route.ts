import { Router } from "express";
import { AIController } from "../controller/ai.controller";

const router = Router();

router.post("/chat", AIController.callCharGPT);

export default router;
