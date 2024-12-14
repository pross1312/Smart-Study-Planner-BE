import { Request, Response, NextFunction } from 'express';
import { debugLog } from "../log/logger";
import AppError from '../exception/appError';
import jwt from 'jsonwebtoken';
import {UserModel, User} from "../model/user.model";

const AuthGuard = (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.get("Authorization");
    debugLog(authorization);
    if (!authorization) {
        throw new AppError("Unauthorized user is forbidden here.", 401);
    } else if  (authorization.startsWith("Bearer")) {
        const token = authorization.split(' ', 2)[1];
        jwt.verify(token, process.env.JWT_SECRET || "UN", (err, decoded) => {
            if (err) {
                console.log(err);
                throw new AppError(`Invalid json token, error: ${err.message}`, 401);
            } else {
                if ((decoded as any).userId === undefined || (decoded as any).userId === null) {
                    throw new Error("Missing user id from jwt token");
                } else {
                    UserModel.findOne({id: (decoded as any).userId!}).then((user: User | null) => {
                        if (user === null) {
                            throw new Error("Token decoded successfully but user_id is not in database");
                        } else {
                            debugLog("Authorization user: ", user);
                            (req as any).user = user;
                            next();
                        }
                    }).catch(err => {
                        throw err;
                    });
                }
            }
        });
    } else {
        throw new AppError("Authorization unknown", 401);
    }
};

export {AuthGuard};
