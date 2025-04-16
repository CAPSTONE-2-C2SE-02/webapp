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
                    error: "You already checked in today",
                });
            }

            await Checkin.create({ tourGuideId, date: today });

            const ATTENDANCE_SCORE = 5;

            const ranking = await Ranking.findOneAndUpdate(
                { tourGuideId },
                { $inc: { attendanceScore: ATTENDANCE_SCORE } },
                { upsert: true, new: true }
            );

            const { attendanceScore, completionScore = 0, reviewScore = 0, postScore = 0 } = ranking;
            ranking.totalScore = attendanceScore + completionScore + reviewScore + postScore;

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