import { NextFunction, Request, Response, Router } from "express";
import { TourController } from "./tour.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { multerUpload } from "../../../config/multer.config";
import { validationRequest } from "../../middlewares/validationRequest";
import { createTourSchema, updateTourSchema } from "./tour.validation";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.GUIDE),
  multerUpload.array("files"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = createTourSchema.parse(JSON.parse(req.body.data));
    return TourController.createTour(req, res, next);
  }
);

router.get("/", TourController.getAllTours);
router.get(
  "/my-tours",
  checkAuth(UserRole.GUIDE),
  TourController.getGuideTours
);
router.get("/:id", TourController.getTourById);

router.patch("/:id", checkAuth(UserRole.GUIDE), multerUpload.array("files"), validationRequest(updateTourSchema), TourController.updateTour);

router.delete("/:id", checkAuth(UserRole.GUIDE, UserRole.ADMIN), TourController.deleteTour);


export const TourRouter = router;
