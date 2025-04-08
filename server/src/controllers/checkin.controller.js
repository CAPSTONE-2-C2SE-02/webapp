import dayjs from 'dayjs';
import { StatusCodes } from "http-status-codes";
import Checkin from "../models/checkin.model.js";
import Ranking from "../models/ranking.model.js";

class CheckinController {
    // [POST] /api/v1/checkin
    async checkinToday(req, res) {
        try {
            const tourGuideId = req.user.userId;
            const today = dayjs().startOf('day').toDate();

            const existing = await Checkin.findOne({ tourGuideId, date: today });
            if (existing) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "You checked in today",
                });
            }

            await Checkin.create({ tourGuideId, date: today });

            // Cập nhật điểm ranking
            const RANKING_WEIGHT = {
                attendance: 1,
            };

            const ranking = await Ranking.findOneAndUpdate(
                { tourGuideId },
                { $inc: { attendanceScore: RANKING_WEIGHT.attendance } },
                { upsert: true, new: true }
            );

            const { attendanceScore, reviewScore, rankingWeight } = ranking;
            ranking.totalScore =
                attendanceScore * rankingWeight.attendanceWeight +
                reviewScore * rankingWeight.reviewWeight;

            await ranking.save();

            const updatedRanking = await Ranking.findOne({ tourGuideId });

            res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Check-in successful",
                result: {
                    attendanceScore: updatedRanking.attendanceScore,
                    totalScore: updatedRanking.totalScore
                }
            });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || "Internal server error",
            });
        }
    }

    // [GET] /api/v1/checkin
    async getCheckins(req, res) {
        try {
            const tourGuideId = req.user.userId;

            const checkins = await Checkin.find({ tourGuideId }).sort({ date: -1 });

            return res.status(StatusCodes.OK).json({ success: true, result: checkins });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || "Internal server error"
            });
        }
    }
}

export default new CheckinController();