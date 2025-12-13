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
exports.BookingController = void 0;
const booking_service_1 = require("./booking.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const pick_1 = __importDefault(require("../../helpers/pick"));
const booking_constant_1 = require("./booking.constant");
const createBooking = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const payload = {
        tourId: req.body.tourId,
        date: req.body.date ? new Date(req.body.date) : new Date()
    };
    const booking = yield booking_service_1.BookingService.createBooking(payload, decodedToken.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Booking Created Successfully!",
        data: booking,
    });
}));
const getUserBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, pick_1.default)(req.query, booking_constant_1.bookingSearchableFields);
    const bookings = yield booking_service_1.BookingService.getUserBookings(decodedToken.userId, Object.assign(Object.assign({}, filters), options));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings.data,
        meta: bookings.meta,
    });
}));
const getBookingById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield booking_service_1.BookingService.getBookingById(req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
    });
}));
const getAllBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, pick_1.default)(req.query, booking_constant_1.bookingSearchableFields);
    const bookings = yield booking_service_1.BookingService.getAllBookings(Object.assign(Object.assign({}, filters), options));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "All bookings retrieved successfully",
        data: bookings.data,
        meta: bookings.meta
    });
}));
const updateBookingStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const updated = yield booking_service_1.BookingService.updateBookingStatus(req.params.id, req.body.status, user.role);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Booking status updated successfully",
        data: updated,
    });
}));
const getGuideBookings = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decodedToken = req.user;
    const options = (0, pick_1.default)(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const filters = (0, pick_1.default)(req.query, booking_constant_1.bookingSearchableFields);
    const bookings = yield booking_service_1.BookingService.getGuideBookings(decodedToken.userId, Object.assign(Object.assign({}, filters), options));
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Guide bookings retrieved successfully",
        data: bookings.data,
        meta: bookings.meta,
    });
}));
exports.BookingController = {
    createBooking,
    getUserBookings,
    getBookingById,
    getAllBookings,
    updateBookingStatus,
    getGuideBookings
};
