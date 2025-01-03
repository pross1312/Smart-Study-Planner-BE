import {Router} from "express";
import {UserController} from "../controller/user.controller";

const router: Router = Router();

router.put("/", UserController.update);
router.get("/", UserController.get);
router.get("/leaderboard", UserController.getLeaderboard);

export default router;

