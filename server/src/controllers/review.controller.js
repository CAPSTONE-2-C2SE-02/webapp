import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import notificationController from "../controllers/notification.controller.js";
import Booking from "../models/booking.model.js";
import Ranking from "../models/ranking.model.js";
import Review from "../models/review.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import { updateTourGuideRankingAndRating } from '../services/ranking.service.js';
import { uploadImages } from "../utils/uploadImage.util.js";

class ReviewController {
    // [POST] /api/v1/reviews
    async createReview(req, res) {
        try {
            const { bookingId, ratingForTour, ratingForTourGuide, reviewTour, reviewTourGuide } = req.body;

            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Booking not found" });
            }

            if (booking.travelerId.toString() !== req.user.userId) {
                return res.status(StatusCodes.UNAUTHORIZED).json({
                    success: false,
                    error: "You are not authorized to create a review for this booking"
                });
            }
            if (booking.status !== "COMPLETED") {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "You can only create a review for completed bookings"
                });
            }

            if (booking.isReview) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "You have already created a review for this booking"
                });
            }

            const imageUrls = req.files ? await uploadImages(req.files) : [];

            const review = new Review({
                bookingId: bookingId,
                tourId: booking.tourId,
                travelerId: req.user.userId,
                tourGuideId: booking.tourGuideId,
                ratingForTour: ratingForTour,
                ratingForTourGuide: ratingForTourGuide,
                reviewTour: reviewTour,
                reviewTourGuide: reviewTourGuide,
                imageUrls: imageUrls,
            });

            const savedReview = await review.save();

            booking.isReview = true;
            await booking.save();

            // Cập nhật điểm ranking cho tour guide
            const reviewsForTourGuide = await Review.find({ tourGuideId: booking.tourGuideId });

            let weightedRatingSum = 0;

            reviewsForTourGuide.forEach((review) => {
                const weight = 0.5 + review.ratingForTourGuide * 0.1;
                weightedRatingSum += review.ratingForTourGuide * weight;
            });

            const ranking = await Ranking.findOneAndUpdate(
                { tourGuideId: booking.tourGuideId },
                { reviewScore: weightedRatingSum },
                { upsert: true, new: true }
            );

            const {
                attendanceScore = 0,
                completionScore = 0,
                postScore = 0,
                reviewScore = 0
            } = ranking;

            ranking.totalScore = attendanceScore + completionScore + postScore + reviewScore;
            // Cập nhật tổng điểm cho tour guide
            await updateTourGuideRankingAndRating(booking.tourGuideId);

            await ranking.save();

            // Cập nhật rating trung bình cho tour
            const reviewsForTour = await Review.find({ tourId: booking.tourId });

            const totalRatingForTour = reviewsForTour.reduce((sum, review) => sum + review.ratingForTour, 0);
            const averageRatingForTour = totalRatingForTour / reviewsForTour.length;

            await Tour.findByIdAndUpdate(
                booking.tourId,
                { rating: averageRatingForTour },
                { new: true }
            );

            // Gửi thông báo cho tour guide
            const traveler = await User.findById(req.user.userId);

            await notificationController.sendNotification({
                body: {
                    type: "REVIEW",
                    senderId: req.user.userId,
                    receiverId: booking.tourGuideId,
                    relatedId: booking._id,
                    relatedModel: "Booking",
                    message: `You have received a new review from ${traveler?.fullName || traveler?.username || "a traveler"}.`,
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });

            return res.status(StatusCodes.CREATED).json({ success: true, result: savedReview, message: 'Review created successfully' });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [GET] /api/v1/reviews/tour/:tourId
    async getReviewsByTourId(req, res) {
        try {
            const { tourId } = req.params;

            const reviews = await Review.find({ tourId: tourId })
                .populate('travelerId', 'username fullName profilePicture')
                .populate('tourGuideId', 'username fullName profilePicture');

            return res.status(StatusCodes.OK).json({ success: true, result: reviews });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [GET] /api/v1/reviews/:reviewId
    async getReviewById(req, res) {
        try {
            const { reviewId } = req.params;

            const review = await Review.findById(reviewId)
                .populate('travelerId', 'username fullName profilePicture')
                .populate('tourGuideId', 'username fullName profilePicture')
                .populate('tourId', 'title description imageUrls');

            if (!review) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Review not found" });
            }

            return res.status(StatusCodes.OK).json({ success: true, result: review });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [DELETE] /api/v1/reviews/:reviewId
    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const review = await Review.findById(reviewId);

            if (!review) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Review not found" });
            }

            if (review.travelerId.toString() !== req.user.userId) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: "You are not allowed to delete this review" });
            }

            await review.delete(); // soft delete

            return res.status(StatusCodes.OK).json({ success: true, message: "Review deleted successfully" });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [GET] /api/v1/reviews/tour-guide/:tourGuideId
    async getReviewsByTourGuideId(req, res) {
        try {
            const { tourGuideId } = req.params;

            const reviews = await Review.find({ tourGuideId })
                .populate('travelerId', 'username fullName profilePicture')
                .populate('tourId', 'title description imageUrls');

            return res.status(StatusCodes.OK).json({ success: true, result: reviews });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [GET] /api/v1/reviews/tour/:tourId/rating
    async getTourRatingStats(req, res) {
        try {
            const { tourId } = req.params;
            const stats = await Review.aggregate([
                { $match: { tourId: new mongoose.Types.ObjectId(tourId) } },
                {
                    $group: {
                        _id: '$tourId',
                        averageRating: { $avg: '$rating' },
                        totalReviews: { $sum: 1 }
                    }
                }
            ]);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: stats[0] || { averageRating: 0, totalReviews: 0 }
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [GET] /api/v1/reviews/booking/:bookingId
    async getReviewByBookingId(req, res) {
        try {
            const { bookingId } = req.params;

            const review = await Review.findOne({ bookingId })
                .populate('travelerId', 'username fullName profilePicture')
                .populate('tourGuideId', 'username fullName profilePicture')
                .populate('tourId', 'title description imageUrls');

            if (!review) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Review not found for this booking",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: review,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message || "Internal server error",
            });
        }
    }

    // [PUT] /api/v1/reviews/:reviewId
    async updateReview(req, res) {
        try {
            const { reviewId } = req.params;
            const { ratingForTour, ratingForTourGuide, reviewTour, reviewTourGuide } = req.body;

            const review = await Review.findById(reviewId);

            if (!review) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Review not found" });
            }

            // Chỉ cho phép update trong vòng 3 ngày kể từ khi tạo review
            const now = new Date();
            const createdAt = new Date(review.createdAt);
            const diffMs = now - createdAt;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffDays > 3) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: "You can only update your review within 3 days after creation."
                });
            }

            if (review.travelerId.toString() !== req.user.userId) {
                return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, error: "You are not allowed to update this review" });
            }

            if (ratingForTour !== undefined) review.ratingForTour = ratingForTour;
            if (ratingForTourGuide !== undefined) review.ratingForTourGuide = ratingForTourGuide;
            if (reviewTour !== undefined) review.reviewTour = reviewTour;
            if (reviewTourGuide !== undefined) review.reviewTourGuide = reviewTourGuide;

            const existingImages = req.body.existingImages;
            let imageUrls = [];
            if (existingImages) {
                imageUrls = Array.isArray(existingImages)
                    ? existingImages.filter(Boolean)
                    : [existingImages];
            }
            if (req.files && req.files.length > 0) {
                const newImageUrls = await uploadImages(req.files);
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            review.imageUrls = imageUrls;

            await review.save();

            // Cập nhật lại ranking và rating cho tour guide và tour
            const booking = await Booking.findById(review.bookingId);

            // Cập nhật điểm ranking cho tour guide
            const reviewsForTourGuide = await Review.find({ tourGuideId: review.tourGuideId });
            let weightedRatingSum = 0;
            reviewsForTourGuide.forEach((r) => {
                const weight = 0.5 + r.ratingForTourGuide * 0.1;
                weightedRatingSum += r.ratingForTourGuide * weight;
            });

            const ranking = await Ranking.findOneAndUpdate(
                { tourGuideId: review.tourGuideId },
                { reviewScore: weightedRatingSum },
                { upsert: true, new: true }
            );

            const {
                attendanceScore = 0,
                completionScore = 0,
                postScore = 0,
                reviewScore = 0
            } = ranking;

            ranking.totalScore = attendanceScore + completionScore + postScore + reviewScore;
            await updateTourGuideRankingAndRating(review.tourGuideId);
            await ranking.save();

            // Cập nhật rating trung bình cho tour
            const reviewsForTour = await Review.find({ tourId: review.tourId });
            const totalRatingForTour = reviewsForTour.reduce((sum, r) => sum + r.ratingForTour, 0);
            const averageRatingForTour = totalRatingForTour / reviewsForTour.length;

            await Tour.findByIdAndUpdate(
                review.tourId,
                { rating: averageRatingForTour },
                { new: true }
            );

            // Gửi thông báo cho tour guide
            const traveler = await User.findById(req.user.userId);

            await notificationController.sendNotification({
                body: {
                    type: "REVIEW",
                    senderId: req.user.userId,
                    receiverId: review.tourGuideId,
                    relatedId: review.bookingId,
                    relatedModel: "Booking",
                    message: `A review from ${traveler?.fullName || traveler?.username || "a traveler"} has been updated.`,
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });

            return res.status(StatusCodes.OK).json({ success: true, result: review, message: "Review updated successfully" });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }
}

export default new ReviewController();