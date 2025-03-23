import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import StatusTour from "../enums/statusTour.enum.js";

const tourSchema = new mongoose.Schema({
    title: {
        type: String
    },
    introduction: {
        type: String
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    destination: {
        type: String
    },
    departureLocation: {
        type: String
    },
    schedule: [
        {
            day: Number,
            title: String,
            description: String
        }
    ],
    priceForAdult: {
        type: Number
    },
    priceForYoung: {
        type: Number
    },
    priceForChildren: {
        type: Number
    },
    maxParticipants: {
        type: Number
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number
    },
    imageUrls: {
        type: [String],
        default: []
    },
    include: {
        type: String,
    },
    notInclude: {
        type: String,
    },
    status: {
        type: String,
        enum: Object.values(StatusTour),
        default: "ACTIVE"
    },
},
    { timestamps: true }
);

tourSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
