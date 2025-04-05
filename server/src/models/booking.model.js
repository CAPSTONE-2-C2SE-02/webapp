import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";

const bookingSchema = new mongoose.Schema({
    travelerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
    },
    tourGuideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    bookingDate: {
        type: Date,
        default: Date.now,
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED", "CANCELED", "TIMEOUT"],
        default: "PENDING",
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "TIMEOUT", "FAILED", "PAID", "REFUNDED"],
        default: "PENDING",
    },
    adults: {
        type: Number,
    },
    youths: {
        type: Number,
    },
    children: {
        type: Number,
    },
    totalAmount: {
        type: Number,
    },
    depositAmount: {
        type: Number,
    },
    timeoutAt: {
        type: Date,
        index: true,
    },
},
    { timestamps: true, versionKey: false }
)

bookingSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;