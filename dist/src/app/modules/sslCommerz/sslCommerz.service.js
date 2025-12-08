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
exports.SSLService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_codes_1 = require("http-status-codes");
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = require("../../utils/prisma");
const sslPaymentInit = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            store_id: config_1.default.SSL.STORE_ID || "touri6934bf630b575",
            store_passwd: config_1.default.SSL.STORE_PASS || "touri6934bf630b575@ssl",
            total_amount: payload.amount,
            currency: "BDT",
            tran_id: payload.transactionId,
            success_url: `${config_1.default.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
            fail_url: `${config_1.default.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
            cancel_url: `${config_1.default.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
            ipn_url: config_1.default.SSL.SSL_IPN_URL,
            shipping_method: "N/A",
            product_name: "Tour",
            product_category: "Service",
            product_profile: "general",
            cus_name: payload.name,
            cus_email: payload.email,
            cus_add1: "N/A",
            cus_add2: "N/A",
            cus_city: "Chittagong",
            cus_state: "Chittagong",
            cus_postcode: "4000",
            cus_country: "Bangladesh",
            cus_phone: payload.phone,
            cus_fax: "01711111111",
            ship_name: "N/A",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: 1000,
            ship_country: "N/A",
        };
        //console.log("SSLCommerz Request Data:", data);
        const response = yield (0, axios_1.default)({
            method: "POST",
            url: config_1.default.SSL.SSL_PAYMENT_API,
            data: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        });
        //console.log("sslcomeerz validate api response", response.data);
        return response.data;
    }
    catch (error) {
        console.log("Payment Error Occurred!", error);
        throw new AppError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, error.message);
    }
});
const validatePayment = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, axios_1.default)({
            method: "GET",
            url: `${config_1.default.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${config_1.default.SSL.STORE_ID}&store_passwd=${config_1.default.SSL.STORE_PASS}`
        });
        console.log("sslcomeerz validate api response", response.data);
        yield prisma_1.prisma.payment.update({
            where: { transactionId: payload.tran_id },
            data: { paymentGatewayData: response.data }
        });
        return response.data;
    }
    catch (error) {
        console.log(error);
        throw new AppError_1.default(401, `Payment Validation Error, ${error.message}`);
    }
});
exports.SSLService = {
    sslPaymentInit,
    validatePayment
};
