import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";

export const router = Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes,
    },
]


moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
export default router;