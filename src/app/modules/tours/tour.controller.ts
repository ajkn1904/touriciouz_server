import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { TourService } from "./tour.service";
import pick from "../../helpers/pick";
import { tourSearchableFields } from "./tour.constant";
import { prisma } from "../../utils/prisma";
import AppError from "../../errors/AppError";
import { ITourPayload } from "./tour.interfaces";




const createTour = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;

  const guide = await prisma.guide.findFirst({ where: { userId: decoded.userId } });
  if (!guide) throw new AppError(StatusCodes.BAD_REQUEST, "Guide not found");

  const payload: ITourPayload = {
    ...req.body,
    guideId: guide.id,         
    guideFee: guide.dailyRate, 
    images: (req.files as Express.Multer.File[]).map(file => file.path),
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

  const guide = await prisma.guide.findFirst({ where: { userId: decoded.userId } });
  if (!guide) throw new AppError(StatusCodes.BAD_REQUEST, "Guide not found");
  const guideFee = guide.dailyRate;

  const payload: any = { 
    ...req.body,
    guideFee: guideFee, 
    images: (req.files as Express.Multer.File[]).map(file => file.path) };
  

  const result = await TourService.updateTour(req.params.id, guide.id, payload);

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
    data: result.data,
    meta: result.meta
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
