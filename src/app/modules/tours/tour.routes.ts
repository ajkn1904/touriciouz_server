import { Router } from "express";
import { TourController } from "./tour.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../../config/multer.config";
import { validationRequest } from "../../middlewares/validationRequest";
import { createTourSchema, updateTourSchema } from "./tour.validation";

const router = Router();

router.post( "/", checkAuth(UserRole.GUIDE), multerUpload.array("files", 10), validationRequest(createTourSchema), TourController.createTour
);
router.get("/", TourController.getAllTours);
router.get("/:id", TourController.getTourById);
router.patch("/:id", checkAuth(UserRole.GUIDE), multerUpload.array("files", 10), validationRequest(updateTourSchema), TourController.updateTour);
router.delete("/:id", checkAuth(UserRole.GUIDE, UserRole.ADMIN), TourController.deleteTour);

export const TourRouter = router;
