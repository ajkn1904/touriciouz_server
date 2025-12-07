"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTourSchema = exports.createTourSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createTourSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    itinerary: zod_1.z.string().optional(),
    category: zod_1.z.nativeEnum(client_1.TourCategory),
    packagePrice: zod_1.z.number().min(0),
    durationDays: zod_1.z.number().min(1),
    physicality: zod_1.z.string().optional(),
    location: zod_1.z.string().min(1),
    meetingPoint: zod_1.z.string().optional(),
    maxGroupSize: zod_1.z.number().optional(),
    ageLimit: zod_1.z.string().optional(),
    departure: zod_1.z.string().optional(),
    departureTime: zod_1.z.string().optional(),
    includedLocations: zod_1.z.array(zod_1.z.string()).optional(),
    notIncludedLocations: zod_1.z.array(zod_1.z.string()).optional(),
    priceIncludes: zod_1.z.array(zod_1.z.string()).optional(),
    priceExcludes: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateTourSchema = exports.createTourSchema.partial();
