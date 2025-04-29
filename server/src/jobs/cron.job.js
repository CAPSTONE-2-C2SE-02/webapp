import cron from "node-cron";
import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import { releaseBookedDates } from "../services/calendar.service.js";
import { updateTourGuideRankingAndRating } from "../services/ranking.service.js";

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
        // Lấy tất cả user là tour guide (thay role id cho đúng hệ thống của bạn)
        const tourGuides = await User.find({ role: "67de2632ddfe8bd37f87a471" });
        for (const guide of tourGuides) {
            await updateTourGuideRankingAndRating(guide._id);
        }
        console.log("✅ Done updating tour guide ranking & rating.");
    } catch (error) {
        console.error("❌ Error while updating tour guide ranking & rating:", error);
    }
};

// Đặt lịch cho từng job
cron.schedule("*/1 * * * *", checkExpiredBookings); // mỗi phút kiểm tra booking hết hạn
cron.schedule("0 * * * *", updateTourGuideRanking); // mỗi giờ cập nhật ranking

export { checkExpiredBookings, updateTourGuideRanking };

