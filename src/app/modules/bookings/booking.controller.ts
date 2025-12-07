import { Request, Response } from "express";
import { BookingService } from "./booking.service";
import sendResponse from "../../utils/sendResponse";
import catchAsync from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";

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
  const bookings = await BookingService.getUserBookings(decodedToken.userId);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Bookings retrieved successfully",
    data: bookings
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
  const bookings = await BookingService.getAllBookings();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All bookings retrieved successfully",
    data: bookings,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const updated = await BookingService.updateBookingStatus(
    req.params.id,
    req.body.status
  );
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Booking status updated successfully",
    data: updated,
  });
});

export const BookingController = {
  createBooking,
  getUserBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
};
