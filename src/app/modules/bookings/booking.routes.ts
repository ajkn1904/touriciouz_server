import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validationRequest } from "../../middlewares/validationRequest";
import { createBookingZodSchema, updateBookingStatusZodSchema } from "./booking.validation";
import { BookingController } from "./booking.controller";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/", checkAuth(UserRole.TOURIST), validationRequest(createBookingZodSchema), BookingController.createBooking);
router.get("/", checkAuth(UserRole.ADMIN), BookingController.getAllBookings);
router.get("/my-bookings", checkAuth(...Object.values(UserRole)), BookingController.getUserBookings);
router.get("/:id", checkAuth(...Object.values(UserRole)), BookingController.getBookingById);
router.patch("/status/:id", checkAuth(...Object.values(UserRole)), validationRequest(updateBookingStatusZodSchema), BookingController.updateBookingStatus);

export const BookingRouter = router;