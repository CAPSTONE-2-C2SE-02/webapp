import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import Visibility from "../enums/visibility.enum.js";
import StatusTour from "../enums/statusTour.enum.js";

const tourSchema = new mongoose.Schema({
    nameOfTour: {
        type: String
    },
    introduction: {
        type: String
    },
    tourGuideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
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
    bookedParticipants: {
        type: Number,
        default: 0
    },
    duration: {
        type: Number
    },
    images: {
        type: [String],
        default: []
    },
    include: {
        type: String,
    },
    notInclude: {
        type: String,
    },
    visibility: {
        type: String,
        enum: Object.values(Visibility),
        default: "PUBLIC"
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
