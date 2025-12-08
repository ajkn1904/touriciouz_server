"use strict";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = exports.credentialsLogin = void 0;
const http_status_codes_1 = require("http-status-codes");
const auth_service_1 = require("./auth.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const setCookie_1 = require("../../helpers/setCookie");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const prisma_1 = require("../../utils/prisma");
const userTokens_1 = require("../../utils/userTokens");
const getNewAccessToken = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "No Refresh Token Received from Cookies.");
    }
    const tokenInfo = yield auth_service_1.AuthService.getNewAccessToken(refreshToken);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo,
    });
}));
exports.credentialsLogin = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield prisma_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return next(new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found"));
    }
    if (user.status === "DELETED") {
        return next(new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User is blocked!"));
    }
    const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        return next(new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Invalid password"));
    }
    const userToken = yield (0, userTokens_1.createUserTokens)(user);
    (0, setCookie_1.setAuthCookie)(res, userToken);
    const { password: _ } = user, rest = __rest(user, ["password"]);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Logged in successfully",
        data: {
            accessToken: userToken.accessToken,
            refreshToken: userToken.refreshToken,
            user: rest,
        },
    });
}));
const logout = (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Logged Out Successfully",
        data: null,
    });
}));
exports.AuthController = {
    credentialsLogin: exports.credentialsLogin,
    getNewAccessToken,
    logout,
};
