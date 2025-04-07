import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const reviewSchema = new mongoose.Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking"
        },
        tourId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tour",
        },
        travelerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        tourGuideId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        rating: {
            type: Number,
        },
        reviewTour: {
            type: String,
        },
        reviewTourGuide: {
            type: String,
        },
        imageUrls: {
            type: [String],
        }
    },
    { timestamps: true }
);

reviewSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

export default mongoose.model("Review", reviewSchema);
