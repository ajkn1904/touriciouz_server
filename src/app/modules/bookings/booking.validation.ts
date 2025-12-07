import { z } from "zod";
import { BookingStatus } from "@prisma/client";

export const createBookingZodSchema = z.object({
tourId: z.string().uuid(),      
date: z.coerce.date().optional() 
});

export const updateBookingStatusZodSchema = z.object({
status: z.enum(Object.values(BookingStatus))
});
