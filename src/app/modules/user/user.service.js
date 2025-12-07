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
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../utils/prisma");
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.password) {
        payload.password = yield bcryptjs_1.default.hash(payload.password, Number(config_1.default.salt_round));
    }
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const newUser = yield tx.user.create({ data: payload });
        if (payload.role === "ADMIN") {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "Only valid admin can create admin.");
        }
        switch (payload.role) {
            case client_1.UserRole.GUIDE:
                yield tx.guide.create({
                    data: {
                        userId: newUser.id,
                        expertise: [],
                        dailyRate: 0,
                    },
                });
                break;
            case client_1.UserRole.TOURIST:
            default:
                yield tx.tourist.create({
                    data: { userId: newUser.id },
                });
                break;
        }
        return newUser;
    }));
});
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            phone: true,
            bio: true,
            languages: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
});
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePic: true,
            bio: true,
            languages: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });
});
const getMe = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            profilePic: true,
            bio: true,
            languages: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            guide: {
                select: {
                    expertise: true,
                    dailyRate: true,
                    rating: true,
                    totalTours: true,
                },
            },
        },
    });
});
const updateMyProfile = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "User not found");
        if (data.email) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Email cannot be updated!");
        }
        if (data.password) {
            data.password = yield bcryptjs_1.default.hash(data.password, Number(config_1.default.salt_round));
        }
        const fieldsToUpdate = {};
        const allowedFields = ["name", "password", "bio", "languages", "profilePic", "phone"];
        allowedFields.forEach((f) => {
            if (data[f] !== undefined)
                fieldsToUpdate[f] = data[f];
        });
        const updatedUser = yield tx.user.update({
            where: { id: userId },
            data: fieldsToUpdate,
            select: {
                id: true,
                name: true,
                email: true,
                profilePic: true,
                bio: true,
                languages: true,
                phone: true,
                role: true,
                status: true,
            },
        });
        let roleData = {};
        //GUIDE-specific update
        if (user.role === client_1.UserRole.GUIDE) {
            const guideUpdate = {};
            if (data.expertise !== undefined)
                guideUpdate.expertise = data.expertise;
            if (data.dailyRate !== undefined)
                guideUpdate.dailyRate = data.dailyRate;
            if (Object.keys(guideUpdate).length > 0) {
                const updatedGuide = yield tx.guide.update({
                    where: { userId },
                    data: guideUpdate,
                    select: { expertise: true, dailyRate: true, rating: true, totalTours: true },
                });
                roleData = { guide: updatedGuide };
            }
        }
        return Object.assign(Object.assign({}, updatedUser), roleData);
    }));
});
const updateUserRoleOrStatus = (userId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const currentUser = yield tx.user.findUnique({ where: { id: userId } });
        if (!currentUser)
            throw new Error("User not found");
        const updatedUser = yield tx.user.update({
            where: { id: userId },
            data: updates,
        });
        // If role changed, update foreign tables
        if (updates.role && updates.role !== currentUser.role) {
            switch (currentUser.role) {
                case client_1.UserRole.ADMIN:
                    yield tx.admin.deleteMany({ where: { userId } });
                    break;
                case client_1.UserRole.GUIDE:
                    yield tx.guide.deleteMany({ where: { userId } });
                    break;
                case client_1.UserRole.TOURIST:
                    yield tx.tourist.deleteMany({ where: { userId } });
                    break;
            }
            switch (updates.role) {
                case client_1.UserRole.ADMIN:
                    yield tx.admin.create({ data: { userId } });
                    break;
                case client_1.UserRole.GUIDE:
                    yield tx.guide.create({ data: { userId, expertise: [], dailyRate: 0 } });
                    break;
                case client_1.UserRole.TOURIST:
                    yield tx.tourist.create({ data: { userId } });
                    break;
            }
        }
        return updatedUser;
    }));
});
exports.UserService = {
    createUser,
    getAllUsers,
    getUserById,
    getMe,
    updateUserRoleOrStatus,
    updateMyProfile,
};
