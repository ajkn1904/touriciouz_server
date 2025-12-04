import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.getNewAccessToken);
router.post("/logout", AuthController.logout);


export const AuthRoutes = router;