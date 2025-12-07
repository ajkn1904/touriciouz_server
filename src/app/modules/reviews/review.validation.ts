import z from "zod";

export const createReviewZodSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});


export const updateReviewZodSchema = createReviewZodSchema.partial()