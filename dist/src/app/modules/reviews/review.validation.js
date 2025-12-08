"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewZodSchema = exports.createReviewZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createReviewZodSchema = zod_1.default.object({
    bookingId: zod_1.default.string(),
    rating: zod_1.default.number().min(1).max(5),
    comment: zod_1.default.string().optional(),
});
exports.updateReviewZodSchema = exports.createReviewZodSchema.partial();
