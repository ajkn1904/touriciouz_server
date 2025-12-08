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
exports.createNewAccessTokenWithRefreshToken = exports.createUserTokens = void 0;
const http_status_codes_1 = require("http-status-codes");
const AppError_1 = __importDefault(require("../errors/AppError"));
const jwt_1 = require("./jwt");
const config_1 = __importDefault(require("../../config"));
const prisma_1 = require("./prisma");
const createUserTokens = (user) => {
    const jwtPayload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    const refreshToken = (0, jwt_1.generateToken)(jwtPayload, config_1.default.jwt.refresh_token_secret, config_1.default.jwt.refresh_token_expires_in);
    return { accessToken, refreshToken };
};
exports.createUserTokens = createUserTokens;
const createNewAccessTokenWithRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedRefreshToken = (0, jwt_1.verifyToken)(refreshToken, config_1.default.jwt.refresh_token_secret);
    const isUserExists = yield prisma_1.prisma.user.findUnique({
        where: { email: verifiedRefreshToken.email }
    });
    if (!isUserExists) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User does not exist!");
    }
    if (isUserExists.status === "DELETED") {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User is deleted!");
    }
    ;
    const jwtPayload = {
        userId: isUserExists.id,
        email: isUserExists.email,
        role: isUserExists.role
    };
    const accessToken = (0, jwt_1.generateToken)(jwtPayload, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return accessToken;
});
exports.createNewAccessTokenWithRefreshToken = createNewAccessTokenWithRefreshToken;
