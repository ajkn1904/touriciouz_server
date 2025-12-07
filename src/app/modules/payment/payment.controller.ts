import { Request, Response } from "express";
import { PaymentService } from "./payment.service";
import sendResponse from "../../utils/sendResponse";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import catchAsync from "../../utils/catchAsync";
import config from "../../../config";

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initPayment(req.params.bookingId);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

const successPayment = catchAsync(async (req: Request, res: Response) => {
   const query = req.query as Record<string, string>;
  const tranId = query.tran_id || query.transactionId;

  await PaymentService.successPayment({ tran_id: tranId });

  res.redirect(
    `${config.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.tran_id}&amount=${query.amount}&status=success`
  );
});

const failPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  await PaymentService.failPayment(query);
  const tranId = query.tran_id || query.transactionId;

  res.redirect(
    `${config.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${tranId}&amount=${query.amount}&status=fail`
  );
});

const cancelPayment = catchAsync(async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  await PaymentService.cancelPayment(query);
  const tranId = query.tran_id || query.transactionId;

  res.redirect(
    `${config.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${tranId}&amount=${query.amount}&status=cancel`
  );
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await SSLService.validatePayment(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment validated successfully",
    data: result
  });
});

// const getInvoiceDownloadUrl = catchAsync(async (req: Request, res: Response) => {
//   const { paymentId } = req.params;
//   const result = await PaymentService.getInvoiceDownloadUrl(paymentId);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "Invoice retrieved successfully",
//     data: result,
//   });
// });

export const PaymentController = {
  initPayment,
  successPayment,
  failPayment,
  cancelPayment,
  validatePayment,
  //getInvoiceDownloadUrl,
};
