"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const auth_routes_1 = require("../modules/auth/auth.routes");
const user_routes_1 = require("../modules/user/user.routes");
const tour_routes_1 = require("../modules/tours/tour.routes");
const booking_routes_1 = require("../modules/bookings/booking.routes");
const routes_1 = require("../modules/payment/routes");
const review_routes_1 = require("../modules/reviews/review.routes");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/user",
        route: user_routes_1.UserRouter,
    },
    {
        path: "/tours",
        route: tour_routes_1.TourRouter,
    },
    {
        path: "/booking",
        route: booking_routes_1.BookingRouter,
    },
    {
        path: "/payment",
        route: routes_1.PaymentRouter,
    },
    {
        path: "/reviews",
        route: review_routes_1.ReviewRouter,
    },
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});
exports.default = exports.router;
