import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";

const bookingSchema = new mongoose.Schema({
    travelerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
    },
    tourGuideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    startDay: {
        type: Date,
    },
    endDay: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELED", "TIMEOUT"],
        default: "PENDING",
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "REFUNDED"],
        default: "PENDING",
    },
    depositAmount: {
        type: Number,
    },
    totalAmount: {
        type: Number,
    },
    timeoutAt: {
        type: Date,
    },
},
    { timestamps: true }
)

bookingSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;