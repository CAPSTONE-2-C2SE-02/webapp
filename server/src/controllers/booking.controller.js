import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js"
import User from "../models/user.model.js"
import { StatusCodes } from "http-status-codes";
import { addHours, differenceInHours } from "date-fns";

class BookingController {
    // [POST] /api/v1/bookings/
    async createBooking(req, res) {
        try {
            const { tourId, startDay, endDay, totalAmount } = new Booking(req.body);
            const tour = await Tour.findById(tourId);
            if (!tour)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Tour not found" });

            const tourGuide = await User.findOne({ _id: tour.tourGuideId });
            const traveler = await User.findOne({ _id: req.user.userId });

            const depositAmount = totalAmount * 30 / 100;

            const now = new Date();
            const hoursUntilStart = differenceInHours(startDay, now);

            let timeoutAt;
            if (hoursUntilStart > 48) {
                timeoutAt = addHours(now, 12);
            } else if (hoursUntilStart >= 24) {
                timeoutAt = addHours(now, 6);
            } else {
                timeoutAt = addHours(now, 2);
            }

            const newBooking = {
                travelerId: traveler._id,
                tourId: tourId,
                tourGuideId: tourGuide._id,
                startDay: startDay,
                endDay: endDay,
                totalAmount: totalAmount,
                depositAmount: depositAmount,
                timeoutAt: timeoutAt,
            }

            await Booking.create(newBooking);

            return res.status(StatusCodes.CREATED).json({ success: true, result: newBooking, message: "Booking created successfully" });
        } catch (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: error.message });
        }
    }

    // [GET] /api/v1/bookings/traveler
    async getTravelerBookings(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const bookings = await Booking.find({ travelerId: user._id })
                .populate("travelerId", "fullName email phoneNumber")
                .populate("tourId", "nameOfTour departureLocation destination duration schedule")
                .populate("tourGuideId", "fullName email phoneNumber");

            return res.status(StatusCodes.OK).json({ success: true, result: bookings });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }


    // [GET] /api/v1/bookings/tour-guide
    async getTourGuideBookings(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const bookings = await Booking.find({ tourGuideId: user._id })
                .populate("travelerId", "fullName email phoneNumber")
                .populate("tourId", "nameOfTour departureLocation destination duration schedule")
                .populate("tourGuideId", "fullName email phoneNumber");

            return res.status(StatusCodes.OK).json({ success: true, result: bookings });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [PUT] /api/v1/bookings/:id/confirm
    async confirmBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await Booking.findById(id);
            if (!booking)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Booking not found" });

            const updatedBooking = await Booking.findByIdAndUpdate(id, {
                $set: {
                    status: "CONFIRMED"
                }
            }, { new: true });

            return res.status(StatusCodes.OK).json({ success: true, result: updatedBooking, message: "Booking confirmed successfully" });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [PUT] /api/v1/bookings/:id/cancel
    async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const booking = await Booking.findById(id);
            if (!booking)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Booking not found" });

            const updatedBooking = await Booking.findByIdAndUpdate(id, {
                $set: {
                    status: "CANCEL"
                }
            }, { new: true });
            return res.status(StatusCodes.OK).json({ success: true, result: updatedBooking, message: "Booking canceled successfully" });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

}

export default new BookingController;