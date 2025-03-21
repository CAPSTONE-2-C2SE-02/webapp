import express from "express";
import { authenticated, authorize } from "../middlewares/authorize.middleware.js";
import { validateJsonBody } from "../middlewares/validate.middleware.js";
import { bookingSchema } from "../validations/booking.validation.js";
import bookingController from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", authenticated, authorize("TRAVELER"), validateJsonBody(bookingSchema), bookingController.createBooking);

router.get("/traveler", authenticated, authorize("TRAVELER"), bookingController.getTravelerBookings);

router.get("/tour-guide", authenticated, authorize("TOUR_GUIDE"), bookingController.getTourGuideBookings);

router.put("/:id", authenticated, authorize("TOUR_GUIDE"), bookingController.confirmBooking);

router.put("/:id/confirm", authenticated, authorize("TOUR_GUIDE"), bookingController.confirmBooking);

router.put("/:id/cancel", authenticated, authorize("TOUR_GUIDE"), bookingController.confirmBooking);

export default router;