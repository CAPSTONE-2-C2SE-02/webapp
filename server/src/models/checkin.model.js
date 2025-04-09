import mongoose from 'mongoose';

const CheckinSchema = new mongoose.Schema({
    tourGuideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    }
}, {
    timestamps: true
});

CheckinSchema.index({ tourGuideId: 1, date: 1 }, { unique: true });

export default mongoose.model('Checkin', CheckinSchema);
