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
exports.PaymentService = void 0;
const client_1 = require("@prisma/client");
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_codes_1 = require("http-status-codes");
const prisma = new client_1.PrismaClient();
const initPayment = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const booking = yield prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            tour: true,
            payment: true,
            tourist: { include: { user: true } },
        },
    });
    if (!booking)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, "Booking not found");
    if (booking.payment && booking.payment.status === client_1.PaymentStatus.PAID) {
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Booking already paid");
    }
    const transactionId = ((_a = booking.payment) === null || _a === void 0 ? void 0 : _a.transactionId) || `txn_${Date.now()}_${booking.id}`;
    // If no payment record exists → create one
    const payment = booking.payment ||
        (yield prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: booking.tour.packagePrice + booking.tour.guideFee,
                transactionId,
                status: client_1.PaymentStatus.UNPAID,
            },
        }));
    const sslPayload = {
        name: booking.tourist.user.name,
        email: booking.tourist.user.email,
        amount: payment.amount,
        phone: booking.tourist.user.phone,
        transactionId: payment.transactionId,
    };
    const sslResponse = yield sslCommerz_service_1.SSLService.sslPaymentInit(sslPayload);
    return {
        bookingId: booking.id,
        paymentUrl: sslResponse.GatewayPageURL,
    };
});
const successPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const tranId = query.tran_id || query.transactionId;
    if (!tranId)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Transaction ID is required");
    const payment = yield prisma.payment.update({
        where: { transactionId: tranId },
        data: { status: client_1.PaymentStatus.PAID },
    });
    yield prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CONFIRMED" },
    });
    return payment;
});
const failPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const tranId = query.tran_id || query.transactionId;
    if (!tranId)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Transaction ID is required");
    const payment = yield prisma.payment.update({
        where: { transactionId: tranId },
        data: { status: client_1.PaymentStatus.FAILED },
    });
    yield prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: client_1.BookingStatus.FAILED },
    });
    return payment;
});
const cancelPayment = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const tranId = query.tran_id || query.transactionId;
    if (!tranId)
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "Transaction ID is required");
    const payment = yield prisma.payment.update({
        where: { transactionId: tranId },
        data: { status: client_1.PaymentStatus.CANCELLED },
    });
    yield prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED" },
    });
    return payment;
});
// const getInvoiceDownloadUrl = async (paymentId: string) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: paymentId },
//   });
//   if (!payment) throw new AppError(StatusCodes.NOT_FOUND, "Payment not found");
//   return { invoiceUrl: payment.invoiceUrl };
// };
exports.PaymentService = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    //getInvoiceDownloadUrl,
};
