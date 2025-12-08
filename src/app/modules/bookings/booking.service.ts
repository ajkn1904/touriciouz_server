import { PrismaClient, BookingStatus, PaymentStatus, UserRole } from "@prisma/client";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { getTransactionId } from "../../utils/getTransactionId";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { paginationHelper } from "../../helpers/paginationHelper";
import { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

const createBooking = async (payload: any, userId: string) => {
  const transactionId = getTransactionId();

  const { booking, payment, tourist } = await prisma.$transaction(
    async (tx) => {
      const tour = await tx.tour.findUnique({
        where: { id: payload.tourId },
        select: {
          guideId: true,
          packagePrice: true,
          guideFee: true,
          durationDays: true,
        },
      });
      if (!tour) throw new AppError(StatusCodes.NOT_FOUND, "Tour not found");

      const tourist = await tx.tourist.findUnique({
        where: { userId },
        include: { user: true },
      });
      if (!tourist)
        throw new AppError(StatusCodes.NOT_FOUND, "Tourist profile not found");

      if (!tourist.user.phone)
        throw new AppError(
          StatusCodes.BAD_REQUEST,
          "Add your phone number to book tour."
        );

      const booking = await tx.booking.create({
        data: {
          touristId: tourist.id,
          guideId: tour.guideId,
          tourId: payload.tourId,
          date: payload.date ? new Date(payload.date) : new Date(),
          status: BookingStatus.PENDING,
        },
      });

      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: tour.packagePrice + tour.guideFee * tour.durationDays,
          status: PaymentStatus.UNPAID,
          transactionId,
        },
      });

      return { booking, tour, payment, tourist };
    }
  );

  const sslPayload = {
    name: tourist.user.name as string,
    email: tourist.user.email,
    phone: tourist.user.phone,
    amount: payment.amount,
    transactionId: payment.transactionId,
  };

  const sslPayment = await SSLService.sslPaymentInit(sslPayload);

  return {
    booking,
    payment,
    paymentUrl: sslPayment.GatewayPageURL,
  };
};

const getUserBookings = async (userId: string, query: Record<string, any>) => {
  const tourist = await prisma.tourist.findUnique({
    where: { userId },
  });

  if (!tourist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Tourist profile not found");
  }

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(query);

  const { searchTerm, status, sortBy: _sb, sortOrder: _so, ...filters } = query;

  const where: any = {
    touristId: tourist.id,
  };


  if (searchTerm) {
    where.OR = [
      { status: { contains: searchTerm, mode: "insensitive" } },
      { tour: { title: { contains: searchTerm, mode: "insensitive" } } },
      { guide: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
    ];
  }

  
  if (status) {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        tour: {
          select: {
            id: true,
            title: true,
            category: true,
            packagePrice: true,
            guideFee: true,
            durationDays: true,
            physicality: true,
            location: true,
            meetingPoint: true,
            maxGroupSize: true,
            ageLimit: true,
            departure: true,
            departureTime: true,
            rating: true,
          },
        },

        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            transactionId: true,
          },
        },

        guide: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                languages: true,
              },
            },
          },
        },

        tourist: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                languages: true,
              },
            },
          },
        },
      },

      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
    }),

    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: { total, page, totalPage:Math.ceil(total/limit), limit },
  };
};


const getBookingById = async (bookingId: string) => {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tour: true, payment: true, tourist: true },
  });
};

const getAllBookings = async (query: Record<string, any>) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(query);

  const { searchTerm, status, sortBy: _sb, sortOrder: _so, ...filters } = query;

  const where: any = {};


  if (searchTerm) {
    where.OR = [
      { status: { contains: searchTerm, mode: "insensitive" } },
      { tour: { title: { contains: searchTerm, mode: "insensitive" } } },
      { guide: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
      { tourist: { user: { name: { contains: searchTerm, mode: "insensitive" } } } },
    ];
  }


  if (status) {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        tour: {
          select:{
              id: true,
              title: true,
              category: true,
              packagePrice: true,
              guideFee: true,
              durationDays: true,
              physicality: true,
              location: true,
              meetingPoint: true,
              maxGroupSize: true,
              ageLimit: true,
              departure: true,
              departureTime: true,
              rating: true,
            }
          },
        payment: {
          select:{
            id: true,
            amount: true,
            status: true,
            transactionId: true,
          }
        },
        guide: {
            select: {user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                languages: true,
              },
            },
          },
        },

        tourist: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                languages: true
              },
            },
          },
        },
      },

      orderBy: sortBy ? { [sortBy]: sortOrder } : { createdAt: "desc" },
      skip,
      take: limit,
    }),

    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    meta: { total, page, totalPage:Math.ceil(total/limit), limit },
  };
};



const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus,
  userRole: string
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, guide: true },
  });

  if (!booking) throw new AppError(StatusCodes.NOT_FOUND, "Booking not found");

  if (status === BookingStatus.CANCELLED && booking.payment?.status === PaymentStatus.PAID) {
    if ( userRole !== UserRole.ADMIN && !(userRole === UserRole.GUIDE && booking.guideId === booking.guide.id)) {
      throw new AppError(StatusCodes.FORBIDDEN, "Only the guide or admin can cancel a paid booking");
    }
  }


  // Update booking status
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  });

  // Run payout when completed
  if (status === BookingStatus.COMPLETED) {
    const total = booking.payment?.amount || 0;
    const adminShare = total * 0.1;
    const guideShare = total * 0.9;

    await prisma.$transaction(async (tx) => {
      // Store payout history
      await tx.earnings.create({
        data: {
          bookingId,
          adminEarn: adminShare,
          guideEarn: guideShare,
          guideId: booking.guideId,
          adminId: (await tx.admin.findFirst())?.id, // first admin
        },
      });

      // Update balances
      await tx.guide.update({
        where: { id: booking.guideId },
        data: { balance: { increment: guideShare } },
      });

      const admin = await tx.admin.findFirst();
      if (admin) {
        await tx.admin.update({
          where: { id: admin.id },
          data: { balance: { increment: adminShare } },
        });
      }
    });
  }

if (status === BookingStatus.CANCELLED && booking.payment) {
  if (booking.payment.status === PaymentStatus.PAID) {
    await prisma.payment.update({
      where: { bookingId },
      data: { status: PaymentStatus.REFUNDED },
    });
  }
}

  return updatedBooking;
};


export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingById,
  getAllBookings,
  updateBookingStatus,
};
