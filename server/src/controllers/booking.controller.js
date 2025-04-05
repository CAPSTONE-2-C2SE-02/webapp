import { addMinutes } from "date-fns";
import { StatusCodes } from "http-status-codes";
import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import { releaseSlots, reserveSlots } from "../services/booking.service.js";
import { sendToQueue } from "../services/queue.service.js";
class BookingController {

    // [POST] /api/v1/bookings/
    async createBooking(req, res) {
        try {
            const { tourId, startDate, endDate, adults = 0, youths = 0, children = 0 } = req.body;
            const travelerId = req.user.userId;
            const slots = adults + youths + children;

            const reserved = await reserveSlots(tourId, slots);
            if (!reserved) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Not enough slots for booking"
                });
            }

            const tour = await Tour.findById(tourId);
            if (!tour) {
                await releaseSlots(tourId, slots);
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Tour not found" });
            }

            if (tour.availableSlots < slots) {
                await releaseSlots(tourId, slots);
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Not enough slots" });
            }

            const tourGuide = await User.findOne({ _id: tour.author });
            const totalAmount = (adults * tour.priceForAdult) + (youths * tour.priceForYoung) + (children * tour.priceForChildren);
            const depositAmount = totalAmount * 0.3;

            const timeoutAt = addMinutes(new Date(), 3);

            const newBooking = await Booking.create({
                travelerId,
                tourId,
                tourGuideId: tourGuide._id,
                startDate,
                endDate,
                adults,
                youths,
                children,
                totalAmount,
                depositAmount,
                timeoutAt,
                paymentStatus: "PENDING"
            });

            tour.availableSlots -= slots;
            await tour.save();

            await sendToQueue("booking_created", { bookingId: newBooking._id });

            return res.status(StatusCodes.CREATED).json({
                success: true,
                result: newBooking,
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