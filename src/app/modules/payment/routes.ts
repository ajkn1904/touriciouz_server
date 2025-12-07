import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/init/:bookingId", PaymentController.initPayment);
router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);

// router.get(
//   "/invoice/:paymentId",
//   checkAuth(...Object.values(UserRole)),
//   PaymentController.getInvoiceDownloadUrl
// );

router.post("/validate", PaymentController.validatePayment);

export const PaymentRouter = router;
