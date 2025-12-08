"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    phone: zod_1.z.string({ error: "Phone must be a string" }).min(14).max(20).optional(),
    profilePic: zod_1.z.string().optional(),
    bio: zod_1.z.string().optional(),
    languages: zod_1.z.array(zod_1.z.string()).default([]),
    role: zod_1.z.nativeEnum(client_1.UserRole).optional(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    // GUIDE-specific fields
    expertise: zod_1.z.array(zod_1.z.string()).optional(),
    dailyRate: zod_1.z.number().optional(),
});
exports.updateUserSchema = exports.createUserSchema.partial();
