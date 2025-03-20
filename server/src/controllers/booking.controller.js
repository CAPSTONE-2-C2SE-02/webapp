import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js"
import Profile from "../models/profile.model.js"
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

            const profileTourGuide = await Profile.findOne({ _id: tour.tourGuideId });
            const profileTraveler = await Profile.findOne({ userId: req.user.userId });

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
                travelerId: profileTraveler._id,
                tourId: tourId,
                tourGuideId: profileTourGuide._id,
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
            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Traveler not found" });

            const bookings = await Booking.find({ travelerId: profile._id });

            const responseBooking = await Promise.all(
                bookings.map(async (book) => {
                    const tourGuide = await Profile.findOne({ _id: book.tourGuideId });
                    const tour = await Tour.findOne({ _id: book.tourId });
                    return { ...book.toObject(), tourGuideName: tourGuide.fullName, tourName: tour.nameOfTour };
                })
            );

            return res.status(StatusCodes.OK).json({ success: true, result: responseBooking });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [GET] /api/v1/bookings/tour-guide
    async getTourGuideBookings(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Tour guide not found" });

            const bookings = await Booking.find({ tourGuideId: profile._id });

            const responseBooking = await Promise.all(
                bookings.map(async (book) => {
                    const traveler = await Profile.findOne({ _id: book.travelerId });
                    const tour = await Tour.findOne({ _id: book.tourId });
                    return { ...book.toObject(), travelerName: traveler.fullName, tourName: tour.nameOfTour };
                })
            );
            return res.status(StatusCodes.OK).json({ success: true, result: responseBooking });
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
