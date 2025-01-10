require("dotenv").config();

import fileUpload from 'express-fileupload'
import express, {Express, Request, Response, NextFunction} from "express";
import {configPassport} from "./config/passport-config";
import {repo} from "./repository/postgreSQL";
import authRoute from "./route/auth.route";
import taskRoute from "./route/task.route";
import todoRoute from "./route/todo.route";
import pomodoroRoute from "./route/pomodoro.route";
import userRoute from "./route/user.route";
import aiRoute from "./route/ai.route";

import {debugLog, setDebug} from "./log/logger";
import errorHandler from './middleware/errorHandler';
import {AuthGuard} from './middleware/auth-guard.middleware';
import { CONFIG } from "./config/common";
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

app.use(fileUpload({
    useTempFiles : true,
    limits: {fileSize: 50 * 2024 * 1024}
}));

app.use((req: Request, _res: Response, next: NextFunction) => {
    debugLog(req.path);
    next();
});

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://smart-study-planner-fe.vercel.app",
        "https://pross1312.github.io"
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use((req: Request, res: Response, next: NextFunction) => {
    const origins = [
        "http://localhost:5173",
        "https://smart-study-planner-fe.vercel.app",
        "https://pross1312.github.io"
    ];
    const reqOrigin = req.headers.origin || "";
    console.log(origins);
    console.log(reqOrigin);
    if (origins.includes(reqOrigin)) {
        CONFIG.CLIENT_ADDR = reqOrigin;
    }
    next();
});

app.use(session_handler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configPassport(app);

app.use("/auth", authRoute);
app.use(AuthGuard);
app.use("/task", taskRoute);
app.use("/todo", todoRoute);
app.use("/ai", aiRoute);
app.use("/pomodoro", pomodoroRoute);
app.use("/user", userRoute);

app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server started on 'http://localhost:3000'");
});

