import { z } from "zod";
import { UserRole, UserStatus } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string({error: "Phone must be a string" }).min(14).max(20).optional(),
  profilePic: z.string().optional(),
  bio: z.string().optional(),
  languages: z.array(z.string()).default([]),

  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),

  // GUIDE-specific fields
  expertise: z.array(z.string()).optional(),
  dailyRate: z.number().optional(),
});


export const updateUserSchema  = createUserSchema.partial();