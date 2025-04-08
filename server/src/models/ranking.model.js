import mongoose from 'mongoose';

const RankingSchema = new mongoose.Schema({
    tourGuideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    attendanceScore: {
        type: Number,
        default: 0
    },
    reviewScore: {
        type: Number,
        default: 0
    },
    totalScore: {
        type: Number,
        default: 0
    },
    rankingWeight: {
        reviewWeight: { type: Number, default: 0.6 },
        attendanceWeight: { type: Number, default: 0.4 }
    },
}, {
    timestamps: true
});

RankingSchema.index({ totalScore: -1 });

const Ranking = mongoose.model('Ranking', RankingSchema);

export default Ranking;
