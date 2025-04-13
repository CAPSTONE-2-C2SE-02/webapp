import express from "express";
import calendarController from "../controllers/calendar.controller.js";
import { authenticated, authorize } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { calendarSchema } from "../validations/calendar.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Calendar
 *   description: API for managing tour guide calendars
 */

/**
 * @swagger
 * /calendars:
 *   post:
 *     summary: Set availability for a tour guide
 *     description: Allows a tour guide to set their availability by providing a list of dates.
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dates:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: The date to set availability for.
 *                     status:
 *                       type: string
 *                       enum: [AVAILABLE, UNAVAILABLE]
 *                       description: The status of the date.
 *     responses:
 *       200:
 *         description: Availability updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 */

/**
 * @swagger
 * /calendars/{id}:
 *   get:
 *     summary: Get calendar by tour guide ID
 *     description: Retrieve the calendar of a specific tour guide by their ID.
 *     tags:
 *       - Calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour guide.
 *     responses:
 *       200:
 *         description: Calendar retrieved successfully.
 *       404:
 *         description: Calendar not found.
 */

/**
 * @swagger
 * /calendars/{id}/busy-dates:
 *   get:
 *     summary: Get busy dates for a tour guide
 *     description: Retrieve the list of busy dates for a specific tour guide by their ID.
 *     tags:
 *       - Calendar
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour guide.
 *     responses:
 *       200:
 *         description: Busy dates retrieved successfully.
 *       404:
 *         description: Calendar not found.
 */

/**
 * @swagger
 * /calendars:
 *   put:
 *     summary: Update calendar for a tour guide
 *     description: Allows a tour guide to update the status of a specific date in their calendar.
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date to update.
 *               status:
 *                 type: string
 *                 enum: [AVAILABLE, UNAVAILABLE]
 *                 description: The new status of the date.
 *     responses:
 *       200:
 *         description: Calendar updated successfully.
 *       400:
 *         description: Validation error or date not found.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Calendar not found.
 */

/**
 * @swagger
 * /calendars/{id}:
 *   delete:
 *     summary: Delete a calendar
 *     description: Allows a tour guide to delete their entire calendar.
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour guide.
 *     responses:
 *       200:
 *         description: Calendar deleted successfully.
 *       404:
 *         description: Calendar not found.
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /calendars/{id}/busy-dates:
 *   delete:
 *     summary: Delete a busy date
 *     description: Allows a tour guide to delete a specific busy date and set it to AVAILABLE.
 *     tags:
 *       - Calendar
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour guide.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: The date to be deleted.
 *     responses:
 *       200:
 *         description: Busy date removed successfully.
 *       404:
 *         description: Calendar or date not found.
 *       401:
 *         description: Unauthorized.
 */

// Routes
router.post("/", authenticated, authorize("TOUR_GUIDE"), validate(calendarSchema), calendarController.setAvailability);
router.get("/:id", calendarController.getCalendarByTourGuideId);
router.get("/:id/busy-dates", calendarController.getBusyDates);
router.get("/:id/booked-dates", calendarController.getBookedDates);
router.put("/", authenticated, authorize("TOUR_GUIDE"), calendarController.updateCalendar);
router.delete("/busy-dates", authenticated, authorize("TOUR_GUIDE"), calendarController.deleteBusyDate);
router.delete("/:id", authenticated, authorize("TOUR_GUIDE"), calendarController.deleteCalendar);

export default router;