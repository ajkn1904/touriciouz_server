import { z } from "zod";
import { TourCategory } from "@prisma/client";

export const createTourSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  itinerary: z.string().optional(),

  category: z.nativeEnum(TourCategory),

  packagePrice: z.number().min(0),
  durationDays: z.number().min(1),

  physicality: z.string().optional(),
  location: z.string().min(1),
  meetingPoint: z.string().optional(),
  maxGroupSize: z.number().optional(),

  ageLimit: z.string().optional(),
  departure: z.string().optional(),
  departureTime: z.string().optional(),

  includedLocations: z.array(z.string()).optional(),
  notIncludedLocations: z.array(z.string()).optional(),
  priceIncludes: z.array(z.string()).optional(),
  priceExcludes: z.array(z.string()).optional(),
});

export const updateTourSchema = createTourSchema.partial();
