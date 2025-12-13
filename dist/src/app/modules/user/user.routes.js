"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRouter = void 0;
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const client_1 = require("@prisma/client");
const multer_config_1 = require("../../../config/multer.config");
const validationRequest_1 = require("../../middlewares/validationRequest");
const user_validation_1 = require("./user.validation");
const router = (0, express_1.Router)();
router.post("/", (0, validationRequest_1.validationRequest)(user_validation_1.createUserSchema), user_controller_1.UserController.createUser);
router.get("/", (0, checkAuth_1.checkAuth)(client_1.UserRole.ADMIN), user_controller_1.UserController.getAllUsers);
router.get("/guide/:id", user_controller_1.UserController.getGuideById);
router.get("/me", (0, checkAuth_1.checkAuth)(...Object.values(client_1.UserRole)), user_controller_1.UserController.getMe);
router.patch("/my-profile", (0, checkAuth_1.checkAuth)(...Object.values(client_1.UserRole)), multer_config_1.multerUpload.single("file"), (req, res, next) => {
    req.body = user_validation_1.updateUserSchema.parse(JSON.parse(req.body.data));
    return user_controller_1.UserController.updateMyProfile(req, res, next);
}),
    router.patch("/user-update/:id", (0, checkAuth_1.checkAuth)(client_1.UserRole.ADMIN), (0, validationRequest_1.validationRequest)(user_validation_1.updateUserSchema), user_controller_1.UserController.updateUserRoleOrStatus);
router.get("/:id", user_controller_1.UserController.getUserById);
exports.UserRouter = router;
