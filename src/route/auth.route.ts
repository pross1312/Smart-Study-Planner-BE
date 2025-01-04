import {Router} from "express";
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
}, passport.authenticate("google"), authController.googleLogin);

router.post("/login", authController.login);

router.post("/register", authController.register);

router.post("/register/verify", authController.verifyEmail);

router.get("/password/reset/:email", authController.sendResetPasswordEmail);
router.get("/password/reset-page", authController.sendResetPasswordPage);
router.post("/password/reset", authController.resetPassword);

export default router;

