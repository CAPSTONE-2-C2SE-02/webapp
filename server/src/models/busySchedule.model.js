import mongoose from "mongoose";

const busyScheduleSchema = new mongoose.Schema({
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    slotsUsed: {
        type: Number,
        required: true
    }
});

busyScheduleSchema.index({ tourId: 1, startDate: 1, endDate: 1 });

const BusySchedule = mongoose.model('BusySchedule', busyScheduleSchema); 
export default BusySchedule;
