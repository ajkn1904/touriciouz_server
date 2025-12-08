"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../utils/prisma");
const config_1 = __importDefault(require("../../config"));
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let accessToken = req.headers.authorization || req.cookies.accessToken;
        if (!accessToken) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "No token received");
        }
        if (accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.split(" ")[1];
        }
        const verifiedToken = (0, jwt_1.verifyToken)(accessToken, config_1.default.jwt.jwt_secret);
        const isUserExists = yield prisma_1.prisma.user.findUnique({
            where: { email: verifiedToken.email },
        });
        if (!isUserExists) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User does not exist!");
        }
        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You do not have permission to access this route!");
        }
        req.user = verifiedToken;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkAuth = checkAuth;
