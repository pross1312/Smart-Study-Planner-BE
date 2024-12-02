require("dotenv").config();

import express, {Express, Request, Response} from "express";
import {configPassport} from "./config/passport-config";
import {repo} from "./repository/postgreSQL";
import authRoute from "./route/auth.route";
import {setDebug} from "./log/logger";
import errorHandler from './middleware/errorHandler';
import cors from 'cors'

setDebug(true);

repo.initIfNotExist("./src/init.sql", true);

const app: Express = express();
const session = require("express-session");
const session_handler = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
})
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(session_handler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configPassport(app);

app.use("/auth", authRoute);
app.get("/", (req: Request, res: Response) => {
    res.send("Hello world");
});
app.use(errorHandler);

app.listen(3000, () => {
    console.log("Server started on 'http://localhost:3000'");
});
