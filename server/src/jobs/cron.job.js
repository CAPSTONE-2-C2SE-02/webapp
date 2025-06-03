import cron from "node-cron";
import notificationController from "../controllers/notification.controller.js";
import Booking from "../models/booking.model.js";
import Ranking from "../models/ranking.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
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

        // Quét các booking thanh toán sau (isPayLater: true) nhưng chưa thanh toán trước 48h so với startDate
        const payLaterExpiredBookings = await Booking.find({
            isPayLater: true,
            paymentStatus: "PENDING",
            startDate: { $lte: new Date(now.getTime() + 48 * 60 * 60 * 1000) },
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

const unlockInactiveUsers = async () => {
    try {
        const now = new Date();
        // Tìm user bị khóa và đã quá 7 ngày
        const usersToUnlock = await User.find({
            active: false,
            inactiveAt: { $lte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        });

        for (const user of usersToUnlock) {
            user.active = true;
            user.inactiveAt = null;
            await user.save();

            // Gửi notification mở khóa
            await notificationController.sendNotification({
                body: {
                    type: "WARNING",
                    senderId: null,
                    receiverId: user._id,
                    relatedModel: "User",
                    message: "Your account has been unlocked. You can now book tours again.",
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });
        }
        if (usersToUnlock.length > 0) {
            console.log(`✅ Unlocked ${usersToUnlock.length} users after penalty period.`);
        }
    } catch (error) {
        console.error("❌ Error in unlockInactiveUsers:", error);
    }
};

const checkUserPayLaterViolations = async () => {
    try {
        const users = await User.find({ active: true }); // chỉ kiểm tra user đang active
        for (const user of users) {
            // Lấy 3 booking gần nhất của user bị TIMEOUT và CANCELED với isPayLater
            const timeoutBookings = await Booking.find({
                travelerId: user._id,
                isPayLater: true,
                paymentStatus: "TIMEOUT",
                status: "CANCELED"
            }).sort({ createdAt: -1 }).limit(3);

            // Nếu đủ 3 booking liên tiếp như vậy thì phạt
            if (timeoutBookings.length === 3) {
                user.active = false;
                user.inactiveAt = new Date();
                await user.save();

                // Gửi notification warning
                await notificationController.sendNotification({
                    body: {
                        type: "WARNING",
                        senderId: null,
                        receiverId: user._id,
                        relatedModel: "User",
                        message: "You have made 3 consecutive 'pay later' bookings that were canceled due to payment timeout. Your account is temporarily locked for 7 days.",
                    },
                }, {
                    status: () => ({
                        json: () => { },
                    }),
                });
            }
        }
    } catch (error) {
        console.error("❌ Error in checkUserPayLaterViolations:", error);
    }
};


// Đặt lịch cho từng job
cron.schedule("*/1 * * * *", checkExpiredBookings); // mỗi phút kiểm tra booking hết hạn
cron.schedule("0 * * * *", updateTourGuideRanking); // mỗi giờ cập nhật ranking
cron.schedule("*/5 * * * *", autoUpdateBookingStatus); // mỗi phút tự động hoàn thành và không hoàn thành booking
cron.schedule("*/1 * * * *", unlockInactiveUsers);
cron.schedule("*/1 * * * *", checkUserPayLaterViolations);

export { autoUpdateBookingStatus, checkExpiredBookings, checkUserPayLaterViolations, unlockInactiveUsers, updateTourGuideRanking };

