import mongoose from 'mongoose';

const RankingSchema = new mongoose.Schema({
    tourGuideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    },

    attendanceScore: {
        type: Number,
        default: 0
    },
    completionScore: {
        type: Number,
        default: 0
    },
    reviewScore: {
        type: Number,
        default: 0
    },
    postScore: {
        type: Number,
        default: 0
    },

    totalScore: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

RankingSchema.index({ totalScore: -1 });

const Ranking = mongoose.model('Ranking', RankingSchema);

export default Ranking;
