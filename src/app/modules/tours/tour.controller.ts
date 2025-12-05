import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TourService } from "./tour.service";
import { parseBody } from "../../helpers/parseBody";
import { extractImages } from "../../helpers/extractImages";
import pick from "../../helpers/pick";
import { tourSearchableFields } from "./tour.constant";



const createTour = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const body = parseBody(req);
  const { thumbnailImage, images } = extractImages(req);

  const payload = {
    ...body,
    guideId: decoded.userId,
    thumbnailImage,
    images,
  };

  const result = await TourService.createTour(payload);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Tour created successfully",
    data: result,
  });
});

const updateTour = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const body = parseBody(req);
  const { thumbnailImage, images } = extractImages(req);

  const payload: any = { ...body };
  if (thumbnailImage) payload.thumbnailImage = thumbnailImage;
  if (images.length > 0) payload.images = images;

  const result = await TourService.updateTour(req.params.id, decoded.userId, payload);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour updated successfully",
    data: result,
  });
});

const deleteTour = catchAsync(async (req: Request, res: Response) => {
  const result = await TourService.deleteTour(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour deleted successfully",
    data: result,
  });
});

const getAllTours = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, tourSearchableFields);

  const result = await TourService.getAllTours({ ...options, ...filters });


  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tours retrieved successfully",
    data: result,
  });
});

const getTourById = catchAsync(async (req: Request, res: Response) => {
  const result = await TourService.getTourById(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Tour retrieved successfully",
    data: result,
  });
});

export const TourController = {
  createTour,
  updateTour,
  deleteTour,
  getAllTours,
  getTourById,
};
