import { AIService } from "../service/ai.service";
import AppError from '../exception/appError';
import successHandler from "../utility/ResponseSuccess";
import { Request, Response, NextFunction } from "express";

const AIController = {
    async callCharGPT(req: Request, res: Response, next: NextFunction) {
        try {
            // const user_id = ((req as any)?.user as any)?.id!;
            // const { message } = req.body;
            // const data = await AIService.callChatGPT({ message });
            next(new AppError("Service is currently not available", 400));
        } catch (err) {
            next(err);
        }
    },
};

export { AIController };
