import { addMinutes } from "date-fns";
import dayjs from 'dayjs';
import { StatusCodes } from "http-status-codes";
import notificationController from "../controllers/notification.controller.js";
import Booking from "../models/booking.model.js";
import Ranking from "../models/ranking.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import { isDateBusy, releaseBookedDates, setBookedDates } from "../services/calendar.service.js";
import { sendToQueue } from "../services/queue.service.js";

class BookingController {

    // [POST] /api/v1/bookings/
    async createBooking(req, res) {
        const { tourId, startDate, endDate, adults = 0, youths = 0, children = 0, fullName, country, phoneNumber,
            email, address, city, note, isPayLater = false
        } = req.body;
        const travelerId = req.user.userId;
        const slots = adults + youths + children;

        let tourGuideId;
        try {
            const tour = await Tour.findById(tourId);
            if (!tour) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Tour not found" });
            }

            tourGuideId = tour.author;

            // Kiểm tra ngày bận của tour guide
            const isBusy = await isDateBusy(tour.author, startDate, endDate);
            if (isBusy) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Selected date(s) are not available for booking"
                });
            }

            // Kiểm tra đủ chỗ không
            if (slots > tour.maxParticipants) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: `Total participants exceed tour limit (${tour.maxParticipants})`
                });
            }

            // Set ngày bận cho tour guide
            await setBookedDates(tour.author, startDate, endDate);

            // Tạo booking
            const tourGuide = await User.findById(tour.author);
            const totalAmount = (adults * tour.priceForAdult) +
                (youths * tour.priceForYoung) +
                (children * tour.priceForChildren);
            const depositAmount = totalAmount * 0.3;
            const timeoutAt = isPayLater ? null : addMinutes(new Date(), 3);

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
                isPayLater,
                fullName,
                address,
                city,
                country,
                email,
                phoneNumber,
                note,
                paymentStatus: "PENDING"
            });

            await sendToQueue("BOOKING_CREATED", { bookingId: newBooking._id });

            return res.status(StatusCodes.CREATED).json({
                success: true,
                result: newBooking,
                message: "Booking created successfully"
            });
        } catch (error) {
            await releaseBookedDates(tourGuideId, startDate, endDate);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
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
                .populate("tourId", "title departureLocation destination duration imageUrls")
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
                .populate("tourId", "title departureLocation destination duration imageUrls")
                .populate("tourGuideId", "fullName email phoneNumber");

            return res.status(StatusCodes.OK).json({ success: true, result: bookings });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [POST] /api/v1/bookings/:id/confirm/tour-guide
    async confirmByTourGuide(req, res) {
        try {
            const bookingId = req.params.id;
            const tourGuideId = req.user.userId;

            const booking = await Booking.findById(bookingId);
            if (!booking) return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Booking not found" });

            if (booking.tourGuideId.toString() !== tourGuideId)
                return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: "You are not the tour guide of this booking" });

            if (dayjs().isBefore(dayjs(booking.endDate)))
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Tour has not ended yet" });

            if (booking.status !== "PAID")
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Only paid bookings can be confirmed" });

            booking.status = "WAITING_CONFIRM";
            await booking.save();

            // Send notification for traveler
            await notificationController.sendNotification({
                body: {
                    type: "CONFIRM",
                    senderId: tourGuideId,
                    receiverId: booking.travelerId,
                    relatedId: booking._id,
                    relatedModel: "Booking",
                    message: "Please confirm the completion of the trip",
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });

            return res.status(StatusCodes.OK).json({ success: true, message: "Tour marked as completed by tour guide" });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [POST] /api/v1/bookings/:id/confirm/traveler
    async confirmByTraveler(req, res) {
        try {
            const bookingId = req.params.id;
            const travelerId = req.user.userId;

            const booking = await Booking.findById(bookingId);
            if (!booking) return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Booking not found" });

            if (booking.travelerId.toString() !== travelerId)
                return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: "You are not the traveler of this booking" });

            if (booking.status !== "WAITING_CONFIRM")
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Tour is not ready to confirm yet" });

            booking.status = "COMPLETED";
            await booking.save();

            // Tính điểm ranking
            const ranking = await Ranking.findOneAndUpdate(
                { tourGuideId: booking.tourGuideId },
                { $inc: { completionScore: 10 } },
                { upsert: true, new: true }
            );

            const { attendanceScore = 0, completionScore, reviewScore = 0, postScore = 0 } = ranking;
            ranking.totalScore = attendanceScore + completionScore + reviewScore + postScore;

            await ranking.save();

            // Send notification for tour guide
            const traveler = await User.findOne({ _id: travelerId });

            await notificationController.sendNotification({
                body: {
                    type: "CONFIRM",
                    senderId: travelerId,
                    receiverId: booking.tourGuideId,
                    relatedId: booking._id,
                    relatedModel: "Booking",
                    message: `${traveler.username} has confirmed the completion of the trip`,
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });

            return res.status(200).json({ success: true, message: "Tour confirmed by traveler" });
        } catch (error) {
            return res.status(500).json({ success: false, error: error.message });
        }
    }

    // [POST] /api/v1/bookings/:id/cancel
    async cancelBooking(req, res) {
        try {
            const bookingId = req.params.id;
            const userId = req.user.userId;
            const { reason } = req.body;

            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Booking not found" });
            }

            const isTraveler = booking.travelerId.toString() === userId;
            const isTourGuide = booking.tourGuideId.toString() === userId;

            if (!isTraveler && !isTourGuide) {
                return res.status(StatusCodes.FORBIDDEN).json({ success: false, error: "You are not authorized to cancel this booking" });
            }

            if (booking.status === "CANCELED") {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Booking is already canceled" });
            }

            if (booking.status === "COMPLETED") {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Completed bookings cannot be canceled" });
            }

            booking.status = "CANCELED";
            booking.cancellationReason = reason;
            await booking.save();

            await releaseBookedDates(booking.tourGuideId, booking.startDate, booking.endDate);

            const sender = await User.findById(userId);
            const receiverId = isTraveler ? booking.tourGuideId : booking.travelerId;
            const message = isTraveler
                ? `${sender.username} has canceled the booking with reason: ${reason}`
                : `The tour guide ${sender.username} has canceled the booking with reason: ${reason}`;

            await notificationController.sendNotification({
                body: {
                    type: "CANCEL",
                    senderId: userId,
                    receiverId,
                    relatedId: booking._id,
                    relatedModel: "Booking",
                    message,
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Booking canceled successfully",
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/bookings/pay-later
    async getTravelerPayLaterBookings(req, res) {
        try {
            const userId = req.user.userId;

            const user = await User.findById(userId);
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const bookings = await Booking.find({ travelerId: userId, isPayLater: true })
                .populate("travelerId", "fullName email phoneNumber")
                .populate("tourId", "title departureLocation destination duration imageUrls")
                .populate("tourGuideId", "fullName email phoneNumber");

            return res.status(StatusCodes.OK).json({
                success: true,
                result: bookings,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new BookingController;