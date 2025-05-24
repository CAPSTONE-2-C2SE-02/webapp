import axios from "axios";
import { StatusCodes } from "http-status-codes";
import Bookmark from "../models/bookmark.model.js";
import Interactions from "../models/interactions.model.js";
import Notification from "../models/notification.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";

class TourController {

    // [POST] /api/v1/tours
    async createTour(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const { schedule, ...request } = req.body;
            const imageUrls = req.files ? await uploadImages(req.files) : [];

            const scheduleData = JSON.parse(schedule);

            const newTour = {
                author: user._id,
                schedule: scheduleData,
                ...request,
                imageUrls: imageUrls,
            };

            const tour = await Tour.create(newTour);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Tour created successfully",
                result: tour._id,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [GET] /api/v1/tours
    async getAllTours(req, res) {
        try {
            const sortBy = req.query.sortBy || "createdAt";
            const sortOrder = req.query.sortOrder || "desc";
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Filter params
            const minPrice = parseInt(req.query.minPrice) || 0;
            const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
            const minLength = parseInt(req.query.minLength) || 1;
            const maxLength = parseInt(req.query.maxLength) || Number.MAX_SAFE_INTEGER;
            const minRating = parseFloat(req.query.minRating) || 0;

            const filter = {
                priceForAdult: { $gte: minPrice, $lte: maxPrice },
                duration: { $gte: minLength, $lte: maxLength },
                rating: { $gte: minRating },
            };

            const sortOptions = {};
            if (sortBy === "price") {
                sortOptions.priceForAdult = sortOrder === "asc" ? 1 : -1;
            } else if (sortBy === "rating") {
                sortOptions.rating = sortOrder === 'asc' ? 1 : -1;
            } else if (sortBy === "slot") {
                sortOptions.maxParticipants = sortOrder === 'asc' ? 1 : -1;
            } else {
                sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
            }

            const tours = await Tour
                .find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate("author", "_id username fullName profilePicture ranking rating")
                .populate("bookmarks", "user -itemId");

            const totalTours = await Tour.countDocuments(filter);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalTours,
                    totalPage: Math.ceil(totalTours / limit),
                    currentPage: page,
                    data: tours,
                },
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [GET] /api/v1/tours/:id
    async getTourById(req, res) {
        try {
            const id = req.params.id;
            const tour = await Tour.findById(id)
                .populate("author", "_id username fullName profilePicture ranking rating bio")
                .populate("bookmarks", "user -itemId");

            if (!tour) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Tour not found",
                });
            }

            if (req.user?.userId) {
                const userId = req.user?.userId;
                const interaction = await Interactions.findOne({
                    userId,
                    tourId: id,
                    interaction_type: "VIEW"
                });
                if (!interaction) {
                    const newInteraction = new Interactions({
                        userId,
                        tourId: id,
                        interaction_type: "VIEW"
                    });
                    await newInteraction.save();
                    axios.post(`http://127.0.0.1:8020/retrain`)
                        .then(() => console.log("Retrain queued"))
                        .catch(err => console.error("Retrain error:", err.message));
                }
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: tour
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [PUT] /api/v1/tours/:id
    async updateTour(req, res) {
        try {
            const { id } = req.params;
            const tour = await Tour.findById(id);
            if (!tour) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Tour not found",
                });
            }

            const { schedule, ...request } = req.body;

            const scheduleData = JSON.parse(schedule);

            let imageUrls = [];
            if (request.existingImages) {
                imageUrls = Array.isArray(request.existingImages)
                    ? request.existingImages.filter(Boolean)
                    : [request.existingImages];
            }

            if (req.files && req.files.length > 0) {
                const newImageUrls = await uploadImages(req.files);
                imageUrls = [...imageUrls, ...newImageUrls];
            }

            const updatedTour = await Tour.findByIdAndUpdate(
                id,
                { $set: { ...request, schedule: scheduleData, imageUrls: imageUrls } },
                { new: true }
            ).populate("author", "_id username fullName profilePicture ranking rating");

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Tour has been updated",
                result: updatedTour,
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [DELETE] /api/v1/tours/:id
    async deleteTour(req, res) {
        try {
            const id = req.params.id;
            const tour = await Tour.findById(id);
            if (!tour) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Tour not found",
                });
            }

            await Tour.deleteOne({ _id: id });

            // remove all notifications related to this post
            await Notification.deleteMany({ relatedId: id, relatedModel: "Tour" });
            // remove all bookmarks of this post
            await Bookmark.deleteMany({ itemId: id, itemType: "tour" });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Tour has been deleted",
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [GET] /api/v1/tours/my-tours
    async getMyTours(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const tours = await Tour.find({ author: user._id })
                .populate("author", "_id username fullName profilePicture ranking rating")
                .populate("bookmarks", "user -itemId")
                .sort({ createdAt: -1 });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: tours
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [GET] /api/v1/tours/search?q=
    // search tour by title or destination
    async searchTours(req, res) {
        try {
            const searchQuery = req.query.q?.trim();
            if (!searchQuery) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Search query is required",
                });
            }

            const formattedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, " ");

            let tours = [];

            // first try text search using MongoDB's text index
            tours = await Tour.find(
                { $text: { $search: searchQuery } },
                { score: { $meta: "textScore" } }
            )
                .sort({ score: { $meta: "textScore" } })
                .populate("author", "_id username fullName profilePicture ranking rating")
                .populate("bookmarks", "user -itemId");

            // if no results from text search, try regex search on both title and destination
            if (tours.length === 0) {
                tours = await Tour.find({
                    $or: [
                        { destination: { $regex: formattedQuery, $options: "i" } },
                        { title: { $regex: formattedQuery, $options: "i" } }
                    ],
                })
                    .populate("author", "_id username fullName profilePicture ranking rating")
                    .populate("bookmarks", "user -itemId")
                    .sort({ createdAt: -1 });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: tours,
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [GET] /api/v1/tours/profile/:username
    async getAllToursByUsername(req, res) {
        try {
            const username = req.params.username;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const tours = await Tour.find({ author: user._id })
                .populate("author", "_id username fullName profilePicture ranking rating")
                .populate("bookmarks", "user -itemId")
                .sort({ createdAt: -1 });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: tours
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default new TourController();