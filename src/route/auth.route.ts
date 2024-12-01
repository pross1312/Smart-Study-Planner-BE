import {Router, Request, Response} from "express";
import { debugLog } from "../log/logger";
import authController from "../controller/auth.controller";
const passport = require("passport");

const router: Router = Router();

router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"],
}));

router.get("/google/callback", (req, res, next) => {
    debugLog("Google callback called.");
    next()
}, passport.authenticate("google"), async (req, res) => {
    debugLog("Google logged in successfully.");
    res.redirect("/");
});

router.post("/login", (req, res, next) => {
    authController.login(req, res, next);
})

router.post("/register", (req, res, next) => {
    authController.register(req, res, next);
})

export default router;

