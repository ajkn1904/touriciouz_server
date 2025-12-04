import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRouter } from "../modules/user/user.routes";

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
]


moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
export default router;