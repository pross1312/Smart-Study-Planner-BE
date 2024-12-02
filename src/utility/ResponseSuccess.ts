import { Request, Response, NextFunction } from 'express';

const successHandler = (res: Response, data: any, statusCode: number = 200 ) => {
    res.status(statusCode).json({
        success: true,
        statusCode,
        data,
    });
};

export default successHandler;
