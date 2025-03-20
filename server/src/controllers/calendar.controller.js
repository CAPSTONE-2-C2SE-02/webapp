import { StatusCodes } from "http-status-codes";
import Calendar from "../models/calendar.model.js";
import Profile from "../models/profile.model.js";

class CalendarController {

    // [POST] /api/v1/calendars/
    async setAvailability(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user.userId });
            const { dates } = req.body;

            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }

            let calendar = await Calendar.findOne({ tourGuideId: profile._id });

            if (calendar) {
                calendar.dates = calendar.dates.filter(existingItem =>
                    !dates.some(newItem =>
                        new Date(existingItem.date).getTime() === new Date(newItem.date).getTime()
                    )
                );
                calendar.dates.push(...dates);
            } else {
                calendar = new Calendar({ tourGuideId: profile._id, dates });
            }

            await calendar.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Availability updated successfully.",
                result: calendar,
            });
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/calendars/:id
    async getCalendarByProfile(req, res) {
        try {
            const { id } = req.params;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const calendar = await Calendar.findOne({ tourGuideId: id });

            if (!calendar) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "No calendar found for this tour guide.",
                });
            }

            calendar.dates = calendar.dates.filter(item => new Date(item.date) >= today);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: calendar,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    };

    // [GET] /api/v1/calendars/:id/busy-dates
    async getBusyDates(req, res) {
        try {
            const { id } = req.params;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const calendar = await Calendar.findOne({ tourGuideId: id });

            if (!calendar) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "No calendar found for this tour guide.",
                });
            }

            const busyDates = calendar.dates
                .filter(item => item.status === "UNAVAILABLE" && new Date(item.date) >= today)
                .map(item => item.date);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: busyDates,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [PUT] /api/v1/calendars/:id
    async updateCalendar(req, res) {
        try {
            const { id } = req.params;
            const { date, status } = req.body;

            const calendar = await Calendar.findOne({ tourGuideId: id });

            if (!calendar) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Calendar not found.",
                });
            }

            const dateEntry = calendar.dates.find((d) => d.date.toISOString() === new Date(date).toISOString());

            if (dateEntry) {
                dateEntry.status = status;
            } else {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Date not found in calendar.",
                });
            }

            await calendar.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Calendar updated successfully.",
                result: calendar,
            });
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: error.message,
            });
        }
    };

    // [DELETE] /api/v1/calendars/:id
    async deleteCalendar(req, res) {
        try {
            const { id } = req.params;

            const calendar = await Calendar.findOne({ _id: id });

            if (!calendar) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Calendar not found.",
                });
            }

            await Calendar.delete({ _id: calendar._id });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Calendar deleted successfully.",
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    };

}

export default new CalendarController;
