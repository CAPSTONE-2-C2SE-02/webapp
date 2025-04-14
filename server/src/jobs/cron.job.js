import cron from "node-cron";
import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js";
import { releaseBookedDates } from "../services/calendar.service.js";

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
            return;
        }

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
    } catch (error) {
        console.error("❌ Error while checking expired bookings:", error);
    }
};

cron.schedule("*/1 * * * *", checkExpiredBookings);

export default checkExpiredBookings;
