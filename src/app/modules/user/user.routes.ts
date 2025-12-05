import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../../config/multer.config";
import { validationRequest } from "../../middlewares/validationRequest";
import { createUserSchema, updateUserSchema } from "./user.validation";

const router = Router();

router.post("/", validationRequest(createUserSchema), UserController.createUser);

router.get("/", checkAuth(UserRole.ADMIN), UserController.getAllUsers);
router.get("/me", checkAuth(...Object.values(UserRole)), UserController.getMe);
router.patch("/my-profile", checkAuth(...Object.values(UserRole)), multerUpload.single("file"), validationRequest(updateUserSchema), UserController.updateMyProfile);
router.patch("/user-update/:id", checkAuth(UserRole.ADMIN), validationRequest(updateUserSchema), UserController.updateUserRoleOrStatus);
router.get("/:id", checkAuth(UserRole.ADMIN), UserController.getUserById);

export const UserRouter = router;
