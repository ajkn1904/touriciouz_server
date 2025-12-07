import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRouter } from "../modules/user/user.routes";
import { TourRouter } from "../modules/tours/tour.routes";
import { BookingRouter } from "../modules/bookings/booking.routes";
import { PaymentRouter } from "../modules/payment/routes";
import { ReviewRouter } from "../modules/reviews/review.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRouter,
  },
  {
    path: "/tours",
    route: TourRouter,
  },
  {
    path: "/booking",
    route: BookingRouter,
  },
  {
    path: "/payment",
    route: PaymentRouter,
  },
  {
    path: "/reviews",
    route: ReviewRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
export default router;
