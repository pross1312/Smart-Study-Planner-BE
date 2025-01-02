import {Router} from "express";
import {UserController} from "../controller/user.controller";

const router: Router = Router();

router.put("/", UserController.update);
router.get("/", UserController.get);

export default router;

