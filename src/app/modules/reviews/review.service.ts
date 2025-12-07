import { BookingStatus } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { $ZodCheckMaxLength } from "zod/v4/core";

const createReview = async (touristId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: data.bookingId },
    });
    if (!booking) {
      throw new Error("You cannot review this tour until you complete it.");
    }

    const tourist = await tx.tourist.findUnique({
      where: { userId: touristId },
    });
    if (!tourist) throw new Error("User is not registered as a tourist.");

    const review = await tx.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        tourId: booking.tourId,
        guideId: booking.guideId,
        touristId: tourist.id,
      },
    });

    const tourReviews = await tx.review.findMany({
      where: { tourId: booking.tourId },
    });
    const tourRating =
      tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length;

    await tx.tour.update({
      where: { id: booking.tourId },
      data: { rating: tourRating },
    });

    const guideReviews = await tx.review.findMany({
      where: { guideId: booking.guideId },
    });
    const guideRating =
      guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length;

    await tx.guide.update({
      where: { id: booking.guideId },
      data: { rating: guideRating },
    });

    return review;
  });
};

const getReviewsForTour = async (tourId: string) => {
  return prisma.review.findMany({
    where: { tourId },
    include: {
      tourist: {
        include: { user: true },
      },
    },
  });
};

const getReviewsForGuide = async (guideId: string) => {
  return prisma.review.findMany({
    where: { guideId },
    include: {
      tourist: {
        include: { user: true },
      },
    },
  });
};

const deleteReview = async (id: string, touristId: string) => {
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.findUnique({ where: { id } });
    if (!review) throw new Error("Review not found.");

    const tourist = await tx.tourist.findUnique({
      where: { userId: touristId },
    });
    if (!tourist || review.touristId !== tourist.id) {
      throw new Error("Not authorized to delete this review.");
    }

    // Delete the review
    await tx.review.delete({ where: { id } });

    // Recalculate Tour Rating
    const tourReviews = await tx.review.findMany({
      where: { tourId: review.tourId },
    });
    const tourRating =
      tourReviews.length > 0
        ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
        : 0;
    await tx.tour.update({
      where: { id: review.tourId },
      data: { rating: tourRating },
    });

    // Recalculate Guide Rating
    const guideReviews = await tx.review.findMany({
      where: { guideId: review.guideId },
    });
    const guideRating =
      guideReviews.length > 0
        ? guideReviews.reduce((sum, r) => sum + r.rating, 0) /
          guideReviews.length
        : 0;
    await tx.guide.update({
      where: { id: review.guideId },
      data: { rating: guideRating },
    });

    return { message: "Review deleted successfully" };
  });
};

const updateReview = async (id: string, touristId: string, data: any) => {
  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.findUnique({ where: { id } });
    if (!review) throw new Error("Review not found.");

    const tourist = await tx.tourist.findUnique({
      where: { userId: touristId },
    });
    if (!tourist || review.touristId !== tourist.id) {
      throw new Error("Not authorized to update this review.");
    }

    // Update the review
    const updatedReview = await tx.review.update({
      where: { id },
      data: {
        rating: data.rating ?? review.rating,
        comment: data.comment ?? review.comment,
      },
    });

    // Recalculate Tour Rating
    const tourReviews = await tx.review.findMany({
      where: { tourId: review.tourId },
    });
    const tourRating =
      tourReviews.length > 0
        ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
        : 0;

    await tx.tour.update({
      where: { id: review.tourId },
      data: { rating: tourRating },
    });

    // Recalculate Guide Rating
    const guideReviews = await tx.review.findMany({
      where: { guideId: review.guideId },
    });
    const guideRating =
      guideReviews.length > 0
        ? guideReviews.reduce((sum, r) => sum + r.rating, 0) /
          guideReviews.length
        : 0;

    await tx.guide.update({
      where: { id: review.guideId },
      data: { rating: guideRating },
    });

    return updatedReview;
  });
};

export const ReviewService = {
  createReview,
  getReviewsForGuide,
  getReviewsForTour,
  deleteReview,
  updateReview,
};
