import express from "express";
import reviewController from "../controllers/review.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';
import { validate } from "../middlewares/validate.middleware.js";
import { reviewSchema } from "../validations/review.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: API for managing reviews
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review
 *     description: Allows a traveler to create a review for a completed booking.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: The ID of the booking to review.
 *               rating:
 *                 type: number
 *                 description: The rating for the tour (1-5).
 *               reviewTour:
 *                 type: string
 *                 description: The review content for the tour.
 *               reviewTourGuide:
 *                 type: string
 *                 description: The review content for the tour guide.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images for the review.
 *     responses:
 *       201:
 *         description: Review created successfully.
 *       400:
 *         description: Validation error or booking not found.
 *       401:
 *         description: Unauthorized to review this booking.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reviews/tour/{tourId}:
 *   get:
 *     summary: Get reviews for a tour
 *     description: Retrieve all reviews for a specific tour.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour to retrieve reviews for.
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reviews/{reviewId}:
 *   get:
 *     summary: Get a review by ID
 *     description: Retrieve a single review by its ID.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to retrieve.
 *     responses:
 *       200:
 *         description: Review retrieved successfully.
 *       404:
 *         description: Review not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review
 *     description: Allows a traveler to delete their own review.
 *     tags:
 *       - Reviews
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the review to delete.
 *     responses:
 *       200:
 *         description: Review deleted successfully.
 *       404:
 *         description: Review not found.
 *       401:
 *         description: Unauthorized to delete this review.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reviews/tour-guide/{tourGuideId}:
 *   get:
 *     summary: Get reviews for a tour guide
 *     description: Retrieve all reviews for a specific tour guide.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: tourGuideId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour guide to retrieve reviews for.
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /reviews/tour/{tourId}/rating:
 *   get:
 *     summary: Get tour rating statistics
 *     description: Retrieve the average rating and total number of reviews for a specific tour.
 *     tags:
 *       - Reviews
 *     parameters:
 *       - in: path
 *         name: tourId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour to retrieve rating statistics for.
 *     responses:
 *       200:
 *         description: Rating statistics retrieved successfully.
 *       500:
 *         description: Internal server error.
 */

// Routes
router.post("/", authenticated, upload.array("images"), validate(reviewSchema), reviewController.createReview);
router.get("/:reviewId", reviewController.getReviewById);
router.get("/tour/:tourId", reviewController.getReviewsByTourId);
router.delete("/:reviewId", authenticated, reviewController.deleteReview);
router.get("/tour-guide/:tourGuideId", reviewController.getReviewsByTourGuideId);
router.get("/tour/:tourId/rating", reviewController.getTourRatingStats);
router.get("/booking/:bookingId", reviewController.getReviewByBookingId);

export default router;
