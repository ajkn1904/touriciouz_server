import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRouter } from "../modules/user/user.routes";
import { TourRouter } from "../modules/tours/tour.routes";

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
]


moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
export default router;