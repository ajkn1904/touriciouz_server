import { prisma } from "../../utils/prisma";
import { Tour } from "@prisma/client";
import { deleteImageFromCloudinary } from "../../../config/cloudinary.config";
import { ITourPayload } from "./tour.interfaces";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { paginationHelper } from "../../helpers/paginationHelper";
import { tourSearchableFields } from "./tour.constant";

const createTour = async (payload: ITourPayload): Promise<Tour> => {
  const existing = await prisma.tour.findFirst({ where: { title: payload.title } });
  if (existing) throw new AppError(StatusCodes.BAD_REQUEST, "Tour already exists.");
  if (!payload.guideId) throw new AppError(StatusCodes.BAD_REQUEST, "Guide ID is required");

  return await prisma.$transaction(async (tx) => {
    const tour = await tx.tour.create({ data: payload as any });

    await tx.guide.update({
      where: { id: payload.guideId },
      data: { totalTours: { increment: 1 } },
    });

    return tour;
  });
};


const updateTour = async (
  tourId: string,
  guideId: string,
  payload: Partial<ITourPayload>
): Promise<Tour> => {
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new AppError(StatusCodes.NOT_FOUND, "Tour not found");
  if (tour.guideId !== guideId) throw new AppError(StatusCodes.UNAUTHORIZED, "Unauthorized");

  return await prisma.$transaction(async (tx) => {
    // Merge old + new images
    if (payload.images && payload.images.length > 0 && tour.images.length > 0) {
      payload.images = [...tour.images, ...payload.images];
    }

    const updatedTour = await tx.tour.update({
      where: { id: tourId },
      data: payload as any,
    });

    return updatedTour;
  });
};

const deleteTour = async (tourId: string): Promise<Tour> => {
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) throw new AppError(StatusCodes.NOT_FOUND, "Tour not found");

  return await prisma.$transaction(async (tx) => {
    // Delete images from Cloudinary first
    try {
      if (tour.images.length > 0) {
        await Promise.all(tour.images.map((url) => deleteImageFromCloudinary(url)));
      }
    } catch (error) {
      throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to delete tour images");
    }

    // Delete tour record
    return await prisma.tour.delete({ where: { id: tourId } });

  });
};

const getAllTours = async (query: Record<string, any>) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(query);
  const { searchTerm, page: _p, limit: _l, skip: _s, sortBy: _sb, sortOrder: _so, ...filterData } = query;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: tourSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: { equals: filterData[key] },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions = andConditions.length > 0 ? { AND: andConditions } : {};

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where: whereConditions,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        guide: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      }
    }),
    prisma.tour.count({ where: whereConditions }),
  ]);

  const transformedTours = tours.map(tour => ({
    ...tour,
    guide: tour.guide ? {
      id: tour.guide.id,
      name: tour.guide.user.name,
      email: tour.guide.user.email,
      expertise: tour.guide.expertise,
      dailyRate: tour.guide.dailyRate,
      rating: tour.guide.rating,
    } : null
  }));

  return {
    data: transformedTours,
    meta: { total, page, totalPage: Math.ceil(total / limit), limit },
  };
};


const getTourById = async (id: string) => {
  const tour = await prisma.tour.findUnique({
    where: { id },
    include: {
      guide: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }
    }
  });
  
  if (!tour) throw new AppError(StatusCodes.NOT_FOUND, "Tour not found");
  
  const transformedTour = {
    ...tour,
    guide: tour.guide ? {
      id: tour.guide.id,
      name: tour.guide.user.name,
      email: tour.guide.user.email,
      expertise: tour.guide.expertise,
      dailyRate: tour.guide.dailyRate,
      rating: tour.guide.rating,
    } : null
  };
  
  return transformedTour;
};


const getGuideTours = async (guideId: string, query: Record<string, any>) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper.calculatePagination(query);
  const { status, searchTerm, page: _p, limit: _l, skip: _s, sortBy: _sb, sortOrder: _so, ...filterData } = query;

  const andConditions: any[] = [{ guideId }];

  if (status) andConditions.push({ status });

  if (searchTerm) {
    andConditions.push({
      OR: tourSearchableFields.map((field) => ({
        [field]: { contains: searchTerm, mode: "insensitive" },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: { equals: filterData[key] },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions = { AND: andConditions };

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where: whereConditions,
      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.tour.count({ where: whereConditions }),
  ]);

  return {
    data: tours,
    meta: { total, page, totalPage: Math.ceil(total / limit), limit },
  };
};



export const TourService = {
  createTour,
  updateTour,
  deleteTour,
  getAllTours,
  getTourById,
  getGuideTours
};
