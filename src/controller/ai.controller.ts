import { AIService } from "../service/ai.service";
import successHandler from "../utility/ResponseSuccess";
import { Request, Response, NextFunction } from "express";

const AIController = {
    async getChatHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const {start_time, end_time} = req.query; // to filter created date
            successHandler(res, await AIService.getHistory(user_id, start_time, end_time));
        } catch (err) {
            next(err);
        }
    },

    async prompt(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const {prompt} = req.body;
            successHandler(res, await AIService.prompt(user_id, prompt));
        } catch (err) {
            next(err);
        }
    },

    async analyzeSchedule(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            successHandler(res, await AIService.analyzeSchedule(user_id));
        } catch (err) {
            next(err);
        }
    },

    listModels(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            successHandler(res, AIService.listModels(user_id));
        } catch (err) {
            next(err);
        }
    },

    async switchModel(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            const {model} = req.body;
            AIService.switchModel(user_id, model);
            successHandler(res, "Switch model successfully");
        } catch (err) {
            next(err);
        }
    },

    async clearChatHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            await AIService.clearChatHistory(user_id);
            successHandler(res, "Delete chat history successfully");
        } catch (err) {
            next(err);
        }
    },

    async applySuggestion(req: Request, res: Response, next: NextFunction) {
        try {
            const user_id = ((req as any)?.user as any)?.id!;
            await AIService.applySuggestion(user_id, req.body);
            successHandler(res, "Apply suggestion successfully");
        } catch (err) {
            next(err);
        }
    }
};

export { AIController };
