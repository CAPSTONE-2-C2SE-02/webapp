import Ranking from "../models/ranking.model.js";
import { StatusCodes } from "http-status-codes";

class RankingController {
    // [GET] /api/v1/rankings/top?limit=10
    async getTopRanking(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;

            const rankings = await Ranking.find()
                .sort({ totalScore: -1 })
                .limit(limit)
                .populate("tourGuideId", "fullName profilePicture");

            return res.status(StatusCodes.OK).json({
                success: true,
                result: rankings
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || "Internal server error"
            });
        }
    }

    // [GET] /api/v1/rankings/top/:type?limit=10
    async getTopByType(req, res) {
        try {
            const { type } = req.params;
            const validTypes = ["attendance", "review", "post", "completion"];
            const limit = parseInt(req.query.limit) || 10;

            if (!validTypes.includes(type)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Invalid ranking type",
                });
            }

            const fieldName = `${type}Score`;
            const rankings = await Ranking.find()
                .sort({ [fieldName]: -1 })
                .limit(limit)
                .populate("tourGuideId", "fullName profilePicture");

            return res.status(StatusCodes.OK).json({
                success: true,
                result: rankings
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || "Internal server error"
            });
        }
    }

    // [GET] /api/v1/rankings/me
    async getMyRanking(req, res) {
        try {
            const tourGuideId = req.user.userId;

            const myRanking = await Ranking.findOne({ tourGuideId });
            if (!myRanking) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Ranking not found for this user"
                });
            }

            const rank = await Ranking.countDocuments({
                totalScore: { $gt: myRanking.totalScore }
            });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    rank: rank + 1,
                    ...myRanking.toObject(),
                }
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || "Internal server error"
            });
        }
    }
}

export default new RankingController();
