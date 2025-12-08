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
exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sslCommerz_service_1 = require("../sslCommerz/sslCommerz.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const config_1 = __importDefault(require("../../../config"));
const initPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield payment_service_1.PaymentService.initPayment(req.params.bookingId);
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
}));
const successPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const tranId = query.tran_id || query.transactionId;
    yield payment_service_1.PaymentService.successPayment({ tran_id: tranId });
    res.redirect(`${config_1.default.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.tran_id}&amount=${query.amount}&status=success`);
}));
const failPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    yield payment_service_1.PaymentService.failPayment(query);
    const tranId = query.tran_id || query.transactionId;
    res.redirect(`${config_1.default.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${tranId}&amount=${query.amount}&status=fail`);
}));
const cancelPayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    yield payment_service_1.PaymentService.cancelPayment(query);
    const tranId = query.tran_id || query.transactionId;
    res.redirect(`${config_1.default.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${tranId}&amount=${query.amount}&status=cancel`);
}));
const validatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield sslCommerz_service_1.SSLService.validatePayment(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Payment validated successfully",
        data: result
    });
}));
// const getInvoiceDownloadUrl = catchAsync(async (req: Request, res: Response) => {
//   const { paymentId } = req.params;
//   const result = await PaymentService.getInvoiceDownloadUrl(paymentId);
//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Invoice retrieved successfully",
//     data: result,
//   });
// });
exports.PaymentController = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment,
    validatePayment,
    //getInvoiceDownloadUrl,
};
