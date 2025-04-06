import cron from "node-cron";
import Booking from "../models/booking.model.js";
import { releaseSlots } from "../services/booking.service.js";
import Tour from "../models/tour.model.js";

const checkExpiredBookings = async () => {
    try {
        console.log("🔄 Checking for expired bookings...");

        const now = new Date();

        const expiredBookings = await Booking.find({
            paymentStatus: "PENDING",
            timeoutAt: { $lte: now },
        });

        if (expiredBookings.length === 0) {
            console.log("✅ No expired bookings found.");
            return;
        }

        console.log(`⚠️ Found ${expiredBookings.length} expired bookings. Canceling...`);

        for (const booking of expiredBookings) {
            booking.status = "TIMEOUT";
            booking.paymentStatus = "TIMEOUT";
            await booking.save();

            await releaseSlots(booking.tourId, booking.adults + booking.youths + booking.children);

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
