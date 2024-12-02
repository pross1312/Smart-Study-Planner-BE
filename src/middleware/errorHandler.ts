import { Request, Response, NextFunction } from 'express';
import { debugLog } from "../log/logger";

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = err?.statusCode || 500;
    let message = err?.message || 'Internal Server Error';

    if (statusCode == 500) {
        console.log(err);
        message = 'Internal Server Error';
    } else {
        debugLog(err);
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        data: message,
    });
};

export default errorHandler;
