import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status-codes";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";

const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);

  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = err.message || "Something went wrong!";
  let error = err;

  //cloudinary error
  if(req.file){
    await deleteImageFromCloudinary(req.file.path)
  }
  if(req.files && Array.isArray(req.files) && req.files.length){
    const imageUrls = (req.files as Express.Multer.File[]).map(file => file.path)

    await Promise.all(imageUrls.map(url => deleteImageFromCloudinary(url)))

  }
  
  // Prisma known errors
  // Duplicate
  if (err.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    message = "Duplicate key error";
    error = err.meta;
  }

  // FK constraint
  if (err.code === "P2003") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Foreign key constraint failed";
    error = err.meta;
  }

  if (err.code === "P1000") {
    statusCode = httpStatus.BAD_GATEWAY;
    message = "Authentication failed against database server";
    error = err.meta;
  }

  // Validation errors
  if (err.name === "PrismaClientValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    error = err.message;
  }

  // Initialization / unknown errors
  if (err.name === "PrismaClientUnknownRequestError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Unknown Prisma error occurred!";
    error = err.message;
  }

  if (err.name === "PrismaClientInitializationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Prisma client failed to initialize!";
    error = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export default globalErrorHandler;
