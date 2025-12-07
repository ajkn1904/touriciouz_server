import { Router } from "express";
import { ReviewController } from "./review.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { UserRole } from "@prisma/client";
import { validationRequest } from "../../middlewares/validationRequest";
import { createReviewZodSchema, updateReviewZodSchema } from "./review.validation";

const router = Router();

router.post(
  "/",
  checkAuth(UserRole.TOURIST), 
  validationRequest(createReviewZodSchema),
  ReviewController.createReview
);

router.get("/tour/:tourId", ReviewController.getReviewsForTour);
router.get("/guide/:guideId", ReviewController.getReviewsForGuide);

router.patch(
  "/:id",
  checkAuth(UserRole.TOURIST),
  validationRequest(updateReviewZodSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  checkAuth(UserRole.TOURIST),
  ReviewController.deleteReview
);

export const ReviewRouter = router;
