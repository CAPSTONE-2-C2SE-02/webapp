import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js"
import User from "../models/user.model.js"
import { StatusCodes } from "http-status-codes";
import { addHours, differenceInHours, addMinutes } from "date-fns";
import { reserveSlots, releaseSlots } from "../services/booking.service.js";

class BookingController {
    // [POST] /api/v1/bookings/
    async createBooking(req, res) {
        try {
            const { tourId, startDay, endDay, adults, youths, children, } = new Booking(req.body);
            const travelerId = req.user.userId;
            const slots = (adults || 0) + (youths || 0) + (children || 0);

            const reserved = await reserveSlots(tourId, slots);
            if (!reserved) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Not enough slots for booking"
                });
            }

            const tour = await Tour.findById(tourId);
            if (!tour)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Tour not found" });

            if (tour.availableSlots < slots) {
                await releaseSlots(tourId, slots);
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Not enough slots" });
            }

            const tourGuide = await User.findOne({ _id: tour.author });

            const totalAmount = ((adults || 0) * tour.priceForAdult) + ((youths || 0) * tour.priceForYoung) + ((children || 0) * tour.priceForChildren);
            const depositAmount = totalAmount * 0.3;

            const timeoutAt = addMinutes(new Date(), 3);

            const newBooking = {
                travelerId: travelerId,
                tourId: tourId,
                tourGuideId: tourGuide._id,
                startDay: startDay,
                endDay: endDay,
                adults: adults,
                youths: youths,
                children: children,
                totalAmount: totalAmount,
                depositAmount: depositAmount,
                timeoutAt: timeoutAt,
            }

            const bookingResponse = await Booking.create(newBooking);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                result: bookingResponse,
                message: "Booking created successfully"
            });
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