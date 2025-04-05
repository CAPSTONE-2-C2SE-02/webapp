import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Review from "../models/review.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";

class ReviewController {
    // [POST] /api/v1/reviews
    async createReview(req, res) {
        try {
            const { bookingId, rating, reviewTour, reviewTourGuide } = req.body;

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
            const existingReview = await Review.findOne({ bookingId: bookingId });
            if (existingReview) {
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
                rating: rating,
                reviewTour: reviewTour,
                reviewTourGuide: reviewTourGuide,
                imageUrls: imageUrls,
            });

            const savedReview = await review.save();

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



}

export default new ReviewController();