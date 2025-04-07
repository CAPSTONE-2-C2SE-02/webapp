import express from "express";
import reviewController from "../controllers/review.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';
import { validate } from "../middlewares/validate.middleware.js";
import { reviewSchema } from "../validations/review.validation.js";

const router = express.Router();

router.post("/", authenticated, upload.array("images"), validate(reviewSchema), reviewController.createReview);
router.get("/:reviewId", reviewController.getReviewById);
router.get("/tour/:tourId", reviewController.getReviewsByTourId);
router.delete("/:reviewId", reviewController.deleteReview);
router.get("/tour-guide/:tourGuideId", reviewController.getReviewsByTourGuideId);
router.get("/tour/:tourId/rating", reviewController.getTourRatingStats);

export default router;
