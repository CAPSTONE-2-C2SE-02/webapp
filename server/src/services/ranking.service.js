import User from "../models/user.model.js";
import Ranking from "../models/ranking.model.js";
import Review from "../models/review.model.js";

export const updateTourGuideRankingAndRating = async (tourGuideId) => {
    // Tính rating trung bình từ review
    const reviews = await Review.find({ tourGuideId });
    let avgRating = null;
    if (reviews.length > 0) {
        const total = reviews.reduce((sum, r) => sum + (r.ratingForTourGuide || 0), 0);
        avgRating = total / reviews.length;
    }

    // Lấy ranking hiện tại
    const ranking = await Ranking.findOne({ tourGuideId });
    let rank = null;
    if (ranking) {
        rank = await Ranking.countDocuments({ totalScore: { $gt: ranking.totalScore } }) + 1;
    }

    // Cập nhật vào user
    await User.findByIdAndUpdate(
        tourGuideId,
        {
            rating: avgRating,
            ranking: rank,
        }
    );
};