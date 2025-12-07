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
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const cloudinary_config_1 = require("../../config/cloudinary.config");
const globalErrorHandler = (err, req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(err);
    let statusCode = http_status_codes_1.default.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!";
    let error = err;
    //cloudinary error
    if (req.file) {
        yield (0, cloudinary_config_1.deleteImageFromCloudinary)(req.file.path);
    }
    if (req.files && Array.isArray(req.files) && req.files.length) {
        const imageUrls = req.files.map(file => file.path);
        yield Promise.all(imageUrls.map(url => (0, cloudinary_config_1.deleteImageFromCloudinary)(url)));
    }
    // Prisma known errors
    // Duplicate
    if (err.code === "P2002") {
        statusCode = http_status_codes_1.default.CONFLICT;
        message = "Duplicate key error";
        error = err.meta;
    }
    // FK constraint
    if (err.code === "P2003") {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = "Foreign key constraint failed";
        error = err.meta;
    }
    if (err.code === "P1000") {
        statusCode = http_status_codes_1.default.BAD_GATEWAY;
        message = "Authentication failed against database server";
        error = err.meta;
    }
    // Validation errors
    if (err.name === "PrismaClientValidationError") {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = "Validation Error";
        error = err.message;
    }
    // Initialization / unknown errors
    if (err.name === "PrismaClientUnknownRequestError") {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = "Unknown Prisma error occurred!";
        error = err.message;
    }
    if (err.name === "PrismaClientInitializationError") {
        statusCode = http_status_codes_1.default.BAD_REQUEST;
        message = "Prisma client failed to initialize!";
        error = err.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        error,
    });
});
exports.default = globalErrorHandler;
