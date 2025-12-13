import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import pick from "../../helpers/pick";
import { bookingSearchableFields } from "./booking.constant";

const createBooking = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;


  const payload = {
    tourId: req.body.tourId,    
    date: req.body.date ? new Date(req.body.date) : new Date()
  };

  const booking = await BookingService.createBooking(payload, decodedToken.userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking Created Successfully!",
    data: booking,
  });
});


const getUserBookings = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;

  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, bookingSearchableFields); 

  const bookings = await BookingService.getUserBookings( decodedToken.userId, { ...filters, ...options });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings.data,
    meta: bookings.meta,
  });
});


const getBookingById = catchAsync(async (req: Request, res: Response) => {
  const booking = await BookingService.getBookingById(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking retrieved successfully",
    data: booking,
  });
});

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, bookingSearchableFields);

  const bookings = await BookingService.getAllBookings({...filters, ...options});
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All bookings retrieved successfully",
    data: bookings.data,
    meta: bookings.meta
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as JwtPayload
  const updated = await BookingService.updateBookingStatus(req.params.id, req.body.status, user.role);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking status updated successfully",
    data: updated,
  });
});


const getGuideBookings = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;

  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  const filters = pick(req.query, bookingSearchableFields);

  const bookings = await BookingService.getGuideBookings(
    decodedToken.userId,
    { ...filters, ...options }
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Guide bookings retrieved successfully",
    data: bookings.data,
    meta: bookings.meta,
  });
});


export const BookingController = {
  createBooking,
  getUserBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
  getGuideBookings
};
