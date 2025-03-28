import Booking from "../models/booking.model.js";
import Tour from "../models/tour.model.js";

export const confirmPayment = async (bookingId) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) throw new Error("Booking not found");

        const tour = await Tour.findById(booking.tourId).session(session);
        if (!tour) throw new Error("Tour not found");

        const slots = booking.adults + booking.youths + booking.children;

        if (tour.availableSlots < slots) {
            throw new Error("Tour was sold out before payment.");
        }

        booking.paymentStatus = "PAID";
        booking.status = "PAID";
        tour.availableSlots -= slots;

        await booking.save({ session });
        await tour.save({ session });

        await session.commitTransaction();

        await releaseSlots(booking.tourId, slots);

        return { success: true, message: "Payment successfully" };
    } catch (error) {
        await session.abortTransaction();
        return { success: false, error: error.message };
    } finally {
        session.endSession();
    }
};
