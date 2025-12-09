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
exports.TourService = void 0;
const prisma_1 = require("../../utils/prisma");
const cloudinary_config_1 = require("../../../config/cloudinary.config");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const tour_constant_1 = require("./tour.constant");
const createTour = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield prisma_1.prisma.tour.findFirst({ where: { title: payload.title } });
    if (existing)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Tour already exists.");
    if (!payload.guideId)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Guide ID is required");
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const tour = yield tx.tour.create({ data: payload });
        yield tx.guide.update({
            where: { id: payload.guideId },
            data: { totalTours: { increment: 1 } },
        });
        return tour;
    }));
});
const updateTour = (tourId, guideId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield prisma_1.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Tour not found");
    if (tour.guideId !== guideId)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, "Unauthorized");
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Merge old + new images
        if (payload.images && payload.images.length > 0 && tour.images.length > 0) {
            payload.images = [...tour.images, ...payload.images];
        }
        const updatedTour = yield tx.tour.update({
            where: { id: tourId },
            data: payload,
        });
        return updatedTour;
    }));
});
const deleteTour = (tourId) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield prisma_1.prisma.tour.findUnique({ where: { id: tourId } });
    if (!tour)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Tour not found");
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Delete images from Cloudinary first
        try {
            if (tour.images.length > 0) {
                yield Promise.all(tour.images.map((url) => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
            }
        }
        catch (error) {
            throw new AppError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete tour images");
        }
        // Delete tour record
        return yield prisma_1.prisma.tour.delete({ where: { id: tourId } });
    }));
});
const getAllTours = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(query);
    const { searchTerm } = query, filterData = __rest(query, ["searchTerm"]);
    const andConditions = [];
    if (searchTerm) {
        andConditions.push({
            OR: tour_constant_1.tourSearchableFields.map((field) => ({
                [field]: { contains: searchTerm, mode: "insensitive" },
            })),
        });
    }
    if (Object.keys(filterData).length > 0) {
        const filterConditions = Object.keys(filterData).map((key) => ({
            [key]: { equals: filterData[key] },
        }));
        andConditions.push(...filterConditions);
    }
    const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};
    const [tours, total] = yield Promise.all([
        prisma_1.prisma.tour.findMany({
            where: whereConditions,
            orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.prisma.tour.count({ where: whereConditions }),
    ]);
    return {
        data: tours,
        meta: { total, page, totalPage: Math.ceil(total / limit), limit },
    };
});
const getTourById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const tour = yield prisma_1.prisma.tour.findUnique({ where: { id } });
    if (!tour)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Tour not found");
    return tour;
});
exports.TourService = {
    createTour,
    updateTour,
    deleteTour,
    getAllTours,
    getTourById,
};
