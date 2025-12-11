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
exports.TourController = void 0;
const http_status_codes_1 = require("http-status-codes");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const tour_service_1 = require("./tour.service");
const pick_1 = __importDefault(require("../../helpers/pick"));
const tour_constant_1 = require("./tour.constant");
const prisma_1 = require("../../utils/prisma");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const createTour = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = req.user;
    const guide = yield prisma_1.prisma.guide.findFirst({ where: { userId: decoded.userId } });
    if (!guide)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Guide not found");
    const payload = Object.assign(Object.assign({}, req.body), { guideId: guide.id, guideFee: guide.dailyRate, images: req.files.map(file => file.path) });
    const result = yield tour_service_1.TourService.createTour(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.CREATED,
        success: true,
        message: "Tour created successfully",
        data: result,
    });
}));
const updateTour = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = req.user;
    const guide = yield prisma_1.prisma.guide.findFirst({ where: { userId: decoded.userId } });
    if (!guide)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Guide not found");
    const guideFee = guide.dailyRate;
    const payload = Object.assign(Object.assign({}, req.body), { guideFee: guideFee, images: req.files.map(file => file.path) });
    const result = yield tour_service_1.TourService.updateTour(req.params.id, guide.id, payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Tour updated successfully",
        data: result,
    });
}));
const deleteTour = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.deleteTour(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Tour deleted successfully",
        data: result,
    });
}));
const getAllTours = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, pick_1.default)(req.query, tour_constant_1.tourSearchableFields);
    const result = yield tour_service_1.TourService.getAllTours(Object.assign(Object.assign({}, options), filters));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Tours retrieved successfully",
        data: result.data,
        meta: result.meta
    });
}));
const getTourById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tour_service_1.TourService.getTourById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Tour retrieved successfully",
        data: result,
    });
}));
const getGuideTours = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = req.user;
    const guide = yield prisma_1.prisma.guide.findFirst({ where: { userId: decoded.userId } });
    if (!guide)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Guide not found");
    const result = yield tour_service_1.TourService.getGuideTours(guide.id, req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_codes_1.StatusCodes.OK,
        success: true,
        message: "Guide tours retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
}));
exports.TourController = {
    createTour,
    updateTour,
    deleteTour,
    getAllTours,
    getTourById,
    getGuideTours
};
