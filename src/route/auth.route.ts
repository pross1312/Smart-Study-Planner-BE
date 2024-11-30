import {Router, Request, Response} from "express";
import {debugLog} from "../log/logger";
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

export default router;

