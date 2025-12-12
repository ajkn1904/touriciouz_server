import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";
import { UserRole } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import catchAsync from "../../utils/catchAsync";
import pick from "../../helpers/pick";
import { userSearchableFields } from "./user.constant";

const createUser = catchAsync (async (req: Request, res: Response) => {
    const { role, ...userData } = req.body;
    const result = await UserService.createUser({ ...userData, role });
   
    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "User created successfully",
      data: result,
    });

});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, [...userSearchableFields, "role", "status", "sortBy", "sortOrder"]);

  const result = await UserService.getAllUsers({
    ...options,
    ...filters,
    searchTerm: req.query.searchTerm as string,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.data,
    meta: result.meta
  });
});



const getUserById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await UserService.getUserById(id);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User retrieved successfully",
      data: result,
    });

});

const getMe = catchAsync (async (req: Request, res: Response) => {
    const decodedToken = req.user as JwtPayload; // set in auth middleware
    const result = await UserService.getMe(decodedToken.userId);
    
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile retrieved successfully",
      data: result,
    });
});


const updateUserRoleOrStatus = catchAsync (async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, status } = req.body;

    if (!role && !status) {
      return sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: "At least one field (role or status) must be provided.",
        data: null
      });
    }

    const payload: any = {};
    if (role) payload.role = role;
    if (status) payload.status = status;

    const result = await UserService.updateUserRoleOrStatus(id, payload);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User role/status updated successfully",
      data: result,
    });
});


const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;

  const payload: any = { ...req.body };

  if (payload.languages && typeof payload.languages === "string") {
    try {
      payload.languages = JSON.parse(payload.languages);
    } catch {
      payload.languages = [];
    }
  }

  if (req.file?.path) {
    payload.profilePic = req.file.path;
  }

    const result = await UserService.updateMyProfile(decodedToken.userId, payload);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Profile updated successfully",
      data: result,
    });
});


// Add this function to your user.controller.ts
const getGuideById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getGuideById(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Guide not found");
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Guide retrieved successfully",
    data: result,
  });
});


export const UserController = {
  createUser,
  getAllUsers,
  getUserById,
  getMe,
  updateUserRoleOrStatus,
  updateMyProfile,
  getGuideById
};
