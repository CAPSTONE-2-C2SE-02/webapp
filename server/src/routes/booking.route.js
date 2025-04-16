import express from "express";
import bookingController from "../controllers/booking.controller.js";
import { authenticated, authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { bookingSchema } from "../validations/booking.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: API for managing bookings
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Allows a traveler to create a new booking for a tour.
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tourId:
 *                 type: string
 *                 description: The ID of the tour to book.
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: The start date of the tour.
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: The end date of the tour.
 *               adults:
 *                 type: integer
 *                 description: Number of adults.
 *               youths:
 *                 type: integer
 *                 description: Number of youths.
 *               children:
 *                 type: integer
 *                 description: Number of children.
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *       400:
 *         description: Validation error or not enough slots available.
 *       404:
 *         description: Tour not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /bookings/traveler:
 *   get:
 *     summary: Get bookings for a traveler
 *     description: Retrieve all bookings made by the authenticated traveler.
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully.
 *       404:
 *         description: Traveler not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /bookings/tour-guide:
 *   get:
 *     summary: Get bookings for a tour guide
 *     description: Retrieve all bookings for tours managed by the authenticated tour guide.
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings retrieved successfully.
 *       404:
 *         description: Tour guide not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /bookings/{id}/confirm:
 *   put:
 *     summary: Confirm a booking
 *     description: Allows a tour guide to confirm a booking.
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking to confirm.
 *     responses:
 *       200:
 *         description: Booking confirmed successfully.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking
 *     description: Allows a traveler or tour guide to cancel a booking.
 *     tags:
 *       - Booking
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the booking to cancel.
 *     responses:
 *       200:
 *         description: Booking canceled successfully.
 *       404:
 *         description: Booking not found.
 *       500:
 *         description: Internal server error.
 */

// Routes
router.post("/", authenticated, authorize("TRAVELER"), validate(bookingSchema), bookingController.createBooking);
router.get("/traveler", authenticated, authorize("TRAVELER"), bookingController.getTravelerBookings);
router.get("/traveler/pay-later", authenticated, authorize("TRAVELER"), bookingController.getTravelerPayLaterBookings);
router.get("/tour-guide", authenticated, authorize("TOUR_GUIDE"), bookingController.getTourGuideBookings);
router.post("/:id/confirm/tour-guide", authenticated, authorize("TOUR_GUIDE"), bookingController.confirmByTourGuide);
router.post("/:id/confirm/traveler", authenticated, authorize("TRAVELER"), bookingController.confirmByTraveler);
router.post("/:id/cancel", authenticated, bookingController.cancelBooking);

export default router;