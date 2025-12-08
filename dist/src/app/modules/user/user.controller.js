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
exports.UserController = void 0;
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const user_service_1 = require("./user.service");
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const pick_1 = __importDefault(require("../../helpers/pick"));
const user_constant_1 = require("./user.constant");
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.body, { role } = _a, userData = __rest(_a, ["role"]);
    const result = yield user_service_1.UserService.createUser(Object.assign(Object.assign({}, userData), { role }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "User created successfully",
        data: result,
    });
}));
const getAllUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, pick_1.default)(req.query, [...user_constant_1.userSearchableFields, "role", "status", "sortBy", "sortOrder"]);
    const result = yield user_service_1.UserService.getAllUsers(Object.assign(Object.assign(Object.assign({}, options), filters), { searchTerm: req.query.searchTerm }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Users retrieved successfully",
        data: result.data,
        meta: result.meta
    });
}));
const getUserById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield user_service_1.UserService.getUserById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "User retrieved successfully",
        data: result,
    });
}));
const getMe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user; // set in auth middleware
    const result = yield user_service_1.UserService.getMe(decodedToken.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Profile retrieved successfully",
        data: result,
    });
}));
const updateUserRoleOrStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { role, status } = req.body;
    if (!role && !status) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_codes_1.StatusCodes.BAD_REQUEST,
            success: false,
            message: "At least one field (role or status) must be provided.",
            data: null
        });
    }
    const payload = {};
    if (role)
        payload.role = role;
    if (status)
        payload.status = status;
    const result = yield user_service_1.UserService.updateUserRoleOrStatus(id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "User role/status updated successfully",
        data: result,
    });
}));
const updateMyProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const decodedToken = req.user;
    const payload = Object.assign({}, req.body);
    if (payload.languages && typeof payload.languages === "string") {
        try {
            payload.languages = JSON.parse(payload.languages);
        }
        catch (_b) {
            payload.languages = [];
        }
    }
    if ((_a = req.file) === null || _a === void 0 ? void 0 : _a.path) {
        payload.profilePic = req.file.path;
    }
    const result = yield user_service_1.UserService.updateMyProfile(decodedToken.userId, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
}));
exports.UserController = {
    createUser,
    getAllUsers,
    getUserById,
    getMe,
    updateUserRoleOrStatus,
    updateMyProfile,
};
