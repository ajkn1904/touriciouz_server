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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const prisma_1 = require("../../utils/prisma");
const createReview = (touristId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const booking = yield tx.booking.findUnique({
            where: { id: data.bookingId },
        });
        if (!booking) {
            throw new Error("You cannot review this tour until you complete it.");
        }
        const tourist = yield tx.tourist.findUnique({
            where: { userId: touristId },
        });
        if (!tourist)
            throw new Error("User is not registered as a tourist.");
        const review = yield tx.review.create({
            data: {
                rating: data.rating,
                comment: data.comment,
                tourId: booking.tourId,
                guideId: booking.guideId,
                touristId: tourist.id,
            },
        });
        const tourReviews = yield tx.review.findMany({
            where: { tourId: booking.tourId },
        });
        const tourRating = tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length;
        yield tx.tour.update({
            where: { id: booking.tourId },
            data: { rating: tourRating },
        });
        const guideReviews = yield tx.review.findMany({
            where: { guideId: booking.guideId },
        });
        const guideRating = guideReviews.reduce((sum, r) => sum + r.rating, 0) / guideReviews.length;
        yield tx.guide.update({
            where: { id: booking.guideId },
            data: { rating: guideRating },
        });
        return review;
    }));
});
const getReviewsForTour = (tourId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.review.findMany({
        where: { tourId },
        include: {
            tourist: {
                include: { user: true },
            },
        },
    });
});
const getReviewsForGuide = (guideId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.prisma.review.findMany({
        where: { guideId },
        include: {
            tourist: {
                include: { user: true },
            },
        },
    });
});
const deleteReview = (id, touristId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const review = yield tx.review.findUnique({ where: { id } });
        if (!review)
            throw new Error("Review not found.");
        const tourist = yield tx.tourist.findUnique({
            where: { userId: touristId },
        });
        if (!tourist || review.touristId !== tourist.id) {
            throw new Error("Not authorized to delete this review.");
        }
        // Delete the review
        yield tx.review.delete({ where: { id } });
        // Recalculate Tour Rating
        const tourReviews = yield tx.review.findMany({
            where: { tourId: review.tourId },
        });
        const tourRating = tourReviews.length > 0
            ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
            : 0;
        yield tx.tour.update({
            where: { id: review.tourId },
            data: { rating: tourRating },
        });
        // Recalculate Guide Rating
        const guideReviews = yield tx.review.findMany({
            where: { guideId: review.guideId },
        });
        const guideRating = guideReviews.length > 0
            ? guideReviews.reduce((sum, r) => sum + r.rating, 0) /
                guideReviews.length
            : 0;
        yield tx.guide.update({
            where: { id: review.guideId },
            data: { rating: guideRating },
        });
        return { message: "Review deleted successfully" };
    }));
});
const updateReview = (id, touristId, data) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const review = yield tx.review.findUnique({ where: { id } });
        if (!review)
            throw new Error("Review not found.");
        const tourist = yield tx.tourist.findUnique({
            where: { userId: touristId },
        });
        if (!tourist || review.touristId !== tourist.id) {
            throw new Error("Not authorized to update this review.");
        }
        // Update the review
        const updatedReview = yield tx.review.update({
            where: { id },
            data: {
                rating: (_a = data.rating) !== null && _a !== void 0 ? _a : review.rating,
                comment: (_b = data.comment) !== null && _b !== void 0 ? _b : review.comment,
            },
        });
        // Recalculate Tour Rating
        const tourReviews = yield tx.review.findMany({
            where: { tourId: review.tourId },
        });
        const tourRating = tourReviews.length > 0
            ? tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length
            : 0;
        yield tx.tour.update({
            where: { id: review.tourId },
            data: { rating: tourRating },
        });
        // Recalculate Guide Rating
        const guideReviews = yield tx.review.findMany({
            where: { guideId: review.guideId },
        });
        const guideRating = guideReviews.length > 0
            ? guideReviews.reduce((sum, r) => sum + r.rating, 0) /
                guideReviews.length
            : 0;
        yield tx.guide.update({
            where: { id: review.guideId },
            data: { rating: guideRating },
        });
        return updatedReview;
    }));
});
exports.ReviewService = {
    createReview,
    getReviewsForGuide,
    getReviewsForTour,
    deleteReview,
    updateReview,
};
