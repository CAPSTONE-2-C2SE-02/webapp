import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import Visibility from "../enums/visibility.enum.js";
import StatusTour from "../enums/statusTour.enum.js";

const tourSchema = new mongoose.Schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    guide: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    location: {
        type: String
    },
    itinerary: [
        {
            day: Number,
            title: String,
            description: String
        }
    ],
    price: {
        type: Number
    },
    maxParticipants: {
        type: Number
    },
    bookedParticipants: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    duration: {
        type: Number
    },
    images: {
        type: [String],
        default: []
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
