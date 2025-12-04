import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", UserController.createUser);

router.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);
router.get("/me", checkAuth(...Object.values(UserRole)), UserController.getMe);
router.patch("/my-profile", checkAuth(...Object.values(UserRole)), UserController.updateMyProfile);
router.patch("/user-update/:id", checkAuth(UserRole.ADMIN), UserController.updateUserRoleOrStatus);
router.get("/:id", checkAuth(UserRole.ADMIN), UserController.getUserById);

export const UserRouter = router;
