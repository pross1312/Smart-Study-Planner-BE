require("dotenv").config();

import express, {Express, Request, Response, NextFunction} from "express";
import {configPassport} from "./config/passport-config";
import {repo} from "./repository/postgreSQL";
import authRoute from "./route/auth.route";
import taskRoute from "./route/task.route";
import {debugLog, setDebug} from "./log/logger";
import errorHandler from './middleware/errorHandler';
import {AuthGuard} from './middleware/auth-guard.middleware';
import { CLIENT_ADDR } from "./config/common";
import cors from 'cors'

setDebug(true);


repo.initIfNotExist("./src/init.sql", false);

const app: Express = express();
const session = require("express-session");
const session_handler = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
})

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use((req: Request, _res: Response, next: NextFunction) => {
    debugLog(req.path);
    next();
});

app.use(cors({
    origin: CLIENT_ADDR,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(session_handler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configPassport(app);

app.use("/auth", authRoute);
app.use(AuthGuard);
app.use("/task", taskRoute);
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server started on 'http://localhost:3000'");
});

