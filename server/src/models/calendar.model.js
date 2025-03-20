import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const CalendarSchema = new mongoose.Schema({
    tourGuideId: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    dates: [
        {
            date: { type: Date },
            status: { type: String, enum: ["AVAILABLE", "UNAVAILABLE", "BOOKED"], default: "AVAILABLE" }
        }
    ]
}, { timestamps: true });

CalendarSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

const Calendar = mongoose.model("Calendar", CalendarSchema);
export default Calendar;
