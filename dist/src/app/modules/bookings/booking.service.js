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
exports.BookingService = void 0;
const client_1 = require("@prisma/client");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const getTransactionId_1 = require("../../utils/getTransactionId");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const paginationHelper_1 = require("../../helpers/paginationHelper");
const prisma = new client_1.PrismaClient();
const createBooking = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const transactionId = (0, getTransactionId_1.getTransactionId)();
    const { booking, payment, tourist } = yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const tour = yield tx.tour.findUnique({
            where: { id: payload.tourId },
            select: {
                guideId: true,
                packagePrice: true,
                guideFee: true,
                durationDays: true,
            },
        });
        if (!tour)
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Tour not found");
        const tourist = yield tx.tourist.findUnique({
            where: { userId },
            include: { user: true },
        });
        if (!tourist)
            throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Tourist profile not found");
        if (!tourist.user.phone)
            throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Add your phone number to book tour.");
        const booking = yield tx.booking.create({
            data: {
                touristId: tourist.id,
                guideId: tour.guideId,
                tourId: payload.tourId,
                date: payload.date ? new Date(payload.date) : new Date(),
                status: client_1.BookingStatus.PENDING,
            },
        });
        const payment = yield tx.payment.create({
            data: {
                bookingId: booking.id,
                amount: tour.packagePrice + tour.guideFee * tour.durationDays,
                status: client_1.PaymentStatus.UNPAID,
                transactionId,
            },
        });
        return { booking, tour, payment, tourist };
    }));
    const sslPayload = {
        name: tourist.user.name,
        email: tourist.user.email,
        phone: tourist.user.phone,
        amount: payment.amount,
        transactionId: payment.transactionId,
    };
    const sslPayment = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        booking,
        payment,
        paymentUrl: sslPayment.GatewayPageURL,
    };
});
const getUserBookings = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const tourist = yield prisma.tourist.findUnique({
        where: { userId },
    });
    if (!tourist) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Tourist profile not found");
    }
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(query);
    const { searchTerm, status, sortBy: _sb, sortOrder: _so } = query, filters = __rest(query, ["searchTerm", "status", "sortBy", "sortOrder"]);
    const where = {
        touristId: tourist.id,
    };
    if (searchTerm) {
        where.OR = [
            { status: { contains: searchTerm, mode: "insensitive" } },
            { tour: { title: { contains: searchTerm, mode: "insensitive" } } },
            { guide: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
        ];
    }
    if (status) {
        where.status = status;
    }
    const [bookings, total] = yield Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                tour: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        packagePrice: true,
                        guideFee: true,
                        durationDays: true,
                        physicality: true,
                        location: true,
                        meetingPoint: true,
                        maxGroupSize: true,
                        ageLimit: true,
                        departure: true,
                        departureTime: true,
                        rating: true,
                    },
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        transactionId: true,
                    },
                },
                guide: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                languages: true,
                            },
                        },
                    },
                },
                tourist: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                languages: true,
                            },
                        },
                    },
                },
            },
            orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.booking.count({ where }),
    ]);
    return {
        data: bookings,
        meta: { total, page, totalPage: Math.ceil(total / limit), limit },
    };
});
const getBookingById = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma.booking.findUnique({
        where: { id: bookingId },
        include: { tour: true, payment: true, tourist: true },
    });
});
const getAllBookings = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip, sortBy, sortOrder } = paginationHelper_1.paginationHelper.calculatePagination(query);
    const { searchTerm, status, sortBy: _sb, sortOrder: _so } = query, filters = __rest(query, ["searchTerm", "status", "sortBy", "sortOrder"]);
    const where = {};
    if (searchTerm) {
        where.OR = [
            { status: { contains: searchTerm, mode: "insensitive" } },
            { tour: { title: { contains: searchTerm, mode: "insensitive" } } },
            { guide: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
            { tourist: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
        ];
    }
    if (status) {
        where.status = status;
    }
    const [bookings, total] = yield Promise.all([
        prisma.booking.findMany({
            where,
            include: {
                tour: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        packagePrice: true,
                        guideFee: true,
                        durationDays: true,
                        physicality: true,
                        location: true,
                        meetingPoint: true,
                        maxGroupSize: true,
                        ageLimit: true,
                        departure: true,
                        departureTime: true,
                        rating: true,
                    }
                },
                payment: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        transactionId: true,
                    }
                },
                guide: {
                    select: { user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                languages: true,
                            },
                        },
                    },
                },
                tourist: {
                    select: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                languages: true
                            },
                        },
                    },
                },
            },
            orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma.booking.count({ where }),
    ]);
    return {
        data: bookings,
        meta: { total, page, totalPage: Math.ceil(total / limit), limit },
    };
});
const updateBookingStatus = (bookingId, status) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const booking = yield prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true, guide: true },
    });
    if (!booking)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found");
    // Update booking status
    const updatedBooking = yield prisma.booking.update({
        where: { id: bookingId },
        data: { status },
    });
    // Run payout when completed
    if (status === client_1.BookingStatus.COMPLETED) {
        const total = ((_a = booking.payment) === null || _a === void 0 ? void 0 : _a.amount) || 0;
        const adminShare = total * 0.1;
        const guideShare = total * 0.9;
        yield prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Store payout history
            yield tx.earnings.create({
                data: {
                    bookingId,
                    adminEarn: adminShare,
                    guideEarn: guideShare,
                    guideId: booking.guideId,
                    adminId: (_a = (yield tx.admin.findFirst())) === null || _a === void 0 ? void 0 : _a.id, // first admin
                },
            });
            // Update balances
            yield tx.guide.update({
                where: { id: booking.guideId },
                data: { balance: { increment: guideShare } },
            });
            const admin = yield tx.admin.findFirst();
            if (admin) {
                yield tx.admin.update({
                    where: { id: admin.id },
                    data: { balance: { increment: adminShare } },
                });
            }
        }));
    }
    return updatedBooking;
});
exports.BookingService = {
    createBooking,
    getUserBookings,
    getBookingById,
    getAllBookings,
    updateBookingStatus,
};
