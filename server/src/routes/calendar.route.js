import express from "express";
import calendarController from "../controllers/calendar.controller.js";
import { authenticated, authorize, checkOwnerCalendar } from "../middlewares/authorize.middleware.js";
import { validateJsonBody } from "../middlewares/validate.middleware.js";
import { calendarSchema } from "../validations/calendar.validation.js";

const router = express.Router();

router.post("/", authenticated, authorize("TOUR_GUIDE"), validateJsonBody(calendarSchema), calendarController.setAvailability);

router.get("/:id", calendarController.getCalendarByProfile);

router.get("/:id/busy-dates", calendarController.getBusyDates);

router.put("/:id", authenticated, authorize("TOUR_GUIDE"), checkOwnerCalendar, calendarController.updateCalendar);

router.delete("/:id", authenticated, authorize("TOUR_GUIDE"), checkOwnerCalendar, calendarController.deleteCalendar);

export default router;