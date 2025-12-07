"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatusZodSchema = exports.createBookingZodSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createBookingZodSchema = zod_1.z.object({
    tourId: zod_1.z.string().uuid(),
    date: zod_1.z.coerce.date().optional()
});
exports.updateBookingStatusZodSchema = zod_1.z.object({
    status: zod_1.z.enum(Object.values(client_1.BookingStatus))
});
