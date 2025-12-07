import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReviewService } from "./review.service";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const touristId = req.user.userId;
  const result = await ReviewService.createReview(touristId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Review submitted successfully",
    data: result,
  });
});

const getReviewsForTour = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewsForTour(req.params.tourId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const getReviewsForGuide = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviewsForGuide(req.params.guideId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const touristId = req.user as JwtPayload;
  const result = await ReviewService.deleteReview(
    req.params.id,
    touristId.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Review deleted successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const touristId = req.user as JwtPayload;
  const result = await ReviewService.updateReview(
    req.params.id,
    touristId.userId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Review updated successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getReviewsForGuide,
  getReviewsForTour,
  deleteReview,
  updateReview
};

