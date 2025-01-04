import { Router } from "express";
import { AIController } from "../controller/ai.controller";

const router = Router();

router.get("/chat", AIController.getChatHistory);
router.post("/chat", AIController.prompt);
router.get("/schedule/analytic", AIController.analyzeSchedule);
router.get("/model", AIController.listModels);
router.put("/model", AIController.switchModel);
router.delete("/chat", AIController.clearChatHistory);

export default router;
