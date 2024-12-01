import { Request, Response, NextFunction } from 'express';

const successHandler = (res: Response, data: any, status: number = 200 ) => {
    res.status(status).json({
        success: 'true',
        status,
        data,
    });
};

export default successHandler;
