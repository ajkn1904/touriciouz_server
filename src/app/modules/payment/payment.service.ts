import { PrismaClient, PaymentStatus, BookingStatus } from "@prisma/client";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

const initPayment = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      tour: true,
      payment: true,
      tourist: { include: { user: true } },
    },
  });

  if (!booking) throw new AppError(StatusCodes.NOT_FOUND, "Booking not found");

  if (booking.payment && booking.payment.status === PaymentStatus.PAID) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Booking already paid");
  }

  const transactionId =
    booking.payment?.transactionId || `txn_${Date.now()}_${booking.id}`;

  // If no payment record exists → create one
  const payment =
    booking.payment ||
    (await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.tour.packagePrice + booking.tour.guideFee,
        transactionId,
        status: PaymentStatus.UNPAID,
      },
    }));

  const sslPayload = {
    name: booking.tourist.user.name as string | "Tourist User",
    email: booking.tourist.user.email,
    amount: payment.amount,
    phone: booking.tourist.user.phone,
    transactionId: payment.transactionId,
  };

  const sslResponse = await SSLService.sslPaymentInit(sslPayload);

  return {
    bookingId: booking.id,
    paymentUrl: sslResponse.GatewayPageURL,
  };
};

const successPayment = async (query: Record<string, string>) => {
  const tranId = query.tran_id || query.transactionId;
  if (!tranId)
    throw new AppError(StatusCodes.BAD_REQUEST, "Transaction ID is required");

  const payment = await prisma.payment.update({
    where: { transactionId: tranId },
    data: { status: PaymentStatus.PAID },
  });

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CONFIRMED" },
  });

  return payment;
};

const failPayment = async (query: Record<string, string>) => {
  const tranId = query.tran_id || query.transactionId;
  if (!tranId)
    throw new AppError(StatusCodes.BAD_REQUEST, "Transaction ID is required");

  const payment = await prisma.payment.update({
    where: { transactionId: tranId },
    data: { status: PaymentStatus.FAILED },
  });

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: BookingStatus.FAILED },
  });

  return payment;
};

const cancelPayment = async (query: Record<string, string>) => {
  const tranId = query.tran_id || query.transactionId;
  if (!tranId)
    throw new AppError(StatusCodes.BAD_REQUEST, "Transaction ID is required");

  const payment = await prisma.payment.update({
    where: { transactionId: tranId },
    data: { status: PaymentStatus.CANCELLED },
  });

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "CANCELLED" },
  });

  return payment;
};

// const getInvoiceDownloadUrl = async (paymentId: string) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: paymentId },
//   });

//   if (!payment) throw new AppError(StatusCodes.NOT_FOUND, "Payment not found");

//   return { invoiceUrl: payment.invoiceUrl };
// };

export const PaymentService = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  //getInvoiceDownloadUrl,
};
