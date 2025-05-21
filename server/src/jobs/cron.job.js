import cron from "node-cron";
import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js";
import Ranking from "../models/ranking.model.js";
import User from "../models/user.model.js";
import notificationController from "../controllers/notification.controller.js";
import { releaseBookedDates } from "../services/calendar.service.js";
import { updateTourGuideRankingAndRating } from "../services/ranking.service.js";

const roleTourGuide = "67de2632ddfe8bd37f87a471"; // ID của role Tour Guide

// --- Cron job: Check expired bookings ---
const checkExpiredBookings = async () => {
    try {
        console.log("🔄 Checking for expired bookings...");

        const now = new Date();

        // Quét các booking thanh toán ngay (isPayLater: false)
        const expiredBookings = await Booking.find({
            isPayLater: false,
            paymentStatus: "PENDING",
            timeoutAt: { $lte: now },
        });

        // Quét các booking thanh toán sau (isPayLater: true) nhưng chưa thanh toán trước 24h so với startDate
        const payLaterExpiredBookings = await Booking.find({
            isPayLater: true,
            paymentStatus: "PENDING",
            startDate: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
        });

        const allExpiredBookings = [...expiredBookings, ...payLaterExpiredBookings];

        if (allExpiredBookings.length === 0) {
            console.log("✅ No expired bookings found.");
        } else {
            console.log(`⚠️ Found ${allExpiredBookings.length} expired bookings. Canceling...`);
            for (const booking of allExpiredBookings) {
                booking.status = "CANCELED";
                booking.paymentStatus = "TIMEOUT";
                booking.cancellationReason = "Booking was automatically canceled due to payment timeout.";
                await booking.save();

                // Set lại ngày rảnh cho tour guide
                await releaseBookedDates(booking.tourGuideId, booking.startDate, booking.endDate);

                const tour = await Tour.findById(booking.tourId);
                if (tour) {
                    tour.availableSlots += (booking.adults || 0) + (booking.youths || 0) + (booking.children || 0);
                    await tour.save();
                }
            }
            console.log("✅ Booking status updated & slots released.");
        }
    } catch (error) {
        console.error("❌ Error while checking expired bookings:", error);
    }
};

// --- Cron job: Update tour guide ranking & rating ---
const updateTourGuideRanking = async () => {
    try {
        console.log("🔄 Auto updating tour guide ranking & rating...");
        const tourGuides = await User.find({ role: roleTourGuide });
        for (const guide of tourGuides) {
            await updateTourGuideRankingAndRating(guide._id);
        }
        console.log("✅ Done updating tour guide ranking & rating.");
    } catch (error) {
        console.error("❌ Error while updating tour guide ranking & rating:", error);
    }
};

// --- Cron job: Auto complete & not completed bookings ---
const autoUpdateBookingStatus = async () => {
    try {
        const now = new Date();

        // 1. Tự động hoàn thành nếu WAITING_CONFIRM quá 7 ngày
        const waitingBookings = await Booking.find({
            status: "WAITING_CONFIRM",
            updatedAt: { $lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        });

        for (const booking of waitingBookings) {
            booking.status = "COMPLETED";
            await booking.save();

            // Gửi notification cho tour guide
            await notificationController.sendNotification({
                body: {
                    type: "BOOKING",
                    senderId: null,
                    receiverId: booking.tourGuideId,
                    relatedId: booking._id,
                    relatedModel: "Booking",
                    message: "The booking has been automatically marked as COMPLETED after 7 days.",
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });
        }

        // 2. Tự động set NOT_COMPLETED nếu PAID quá 3 ngày sau endDate
        const notCompletedBookings = await Booking.find({
            status: "PAID",
            endDate: { $lte: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }
        });

        for (const booking of notCompletedBookings) {
            booking.status = "NOT_COMPLETED";
            await booking.save();

            // Trừ 5 điểm trực tiếp vào totalScore
            const ranking = await Ranking.findOneAndUpdate(
                { tourGuideId: booking.tourGuideId },
                { $inc: { totalScore: -5 } },
                { upsert: true, new: true }
            );
            await ranking.save();
            await updateTourGuideRankingAndRating(booking.tourGuideId);

            // Gửi notification cho tour guide
            await notificationController.sendNotification({
                body: {
                    type: "BOOKING",
                    senderId: null,
                    receiverId: booking.tourGuideId,
                    relatedId: booking._id,
                    relatedModel: "Booking",
                    message: "Your booking has been marked as NOT_COMPLETED because you did not confirm completion within 3 days after the tour ended. 5 points have been deducted from your ranking.",
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });
        }

        console.log(`✅ Auto updated ${waitingBookings.length} completed and ${notCompletedBookings.length} not completed bookings.`);
    } catch (error) {
        console.error("❌ Error in autoUpdateBookingStatus:", error);
    }
};

// Đặt lịch cho từng job
cron.schedule("*/1 * * * *", checkExpiredBookings); // mỗi phút kiểm tra booking hết hạn
cron.schedule("0 * * * *", updateTourGuideRanking); // mỗi giờ cập nhật ranking
cron.schedule("*/1 * * * *", autoUpdateBookingStatus); // mỗi phút tự động hoàn thành và không hoàn thành booking

export { checkExpiredBookings, updateTourGuideRanking, autoUpdateBookingStatus };

