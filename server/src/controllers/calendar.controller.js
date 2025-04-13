import { StatusCodes } from "http-status-codes";
import Calendar from "../models/calendar.model.js";
import User from "../models/user.model.js";

class CalendarController {

    // [POST] /api/v1/calendars/
    async setAvailability(req, res) {
        try {
            const { dates } = req.body;

            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            let calendar = await Calendar.findOne({ tourGuideId: user._id });

            if (calendar) {
                calendar.dates = calendar.dates.filter(existingItem =>
                    !dates.some(newItem =>
                        new Date(existingItem.date).getTime() === new Date(newItem.date).getTime()
                    )
                );
                calendar.dates.push(...dates);
            } else {
                calendar = new Calendar({ tourGuideId: user._id, dates });
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
    async getCalendarByTourGuideId(req, res) {
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

    // [GET] /api/v1/calendars/:id/booked-dates
    async getBookedDates(req, res) {
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

            const bookedDates = calendar.dates
                .filter(item => item.status === "BOOKED" && new Date(item.date) >= today)
                .map(item => item.date);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: bookedDates,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [PUT] /api/v1/calendars
    async updateCalendar(req, res) {
        try {
            const tourGuideId = req.user.userId;
            const { date, status } = req.body;

            const calendar = await Calendar.findOne({ tourGuideId: tourGuideId });

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

    // [DELETE] /api/v1/calendars
    async deleteCalendar(req, res) {
        try {
            const tourGuideId = req.user.userId;

            const calendar = await Calendar.findOne({ tourGuideId: tourGuideId });

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

    // [DELETE] /api/v1/calendars/busy-date
    async deleteBusyDate(req, res) {
        try {
            const tourGuideId = req.user.userId;
            const { date } = req.body;

            const calendar = await Calendar.findOne({ tourGuideId: tourGuideId });

            if (!calendar) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Calendar not found.",
                });
            }

            const dateEntry = calendar.dates.find(
                (d) => new Date(d.date).toISOString() === new Date(date).toISOString()
            );

            if (!dateEntry) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Date not found in calendar.",
                });
            }

            dateEntry.status = "AVAILABLE";

            await calendar.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Busy date removed successfully.",
                result: calendar,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new CalendarController;