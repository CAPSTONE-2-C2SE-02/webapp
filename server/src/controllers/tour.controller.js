import { StatusCodes } from "http-status-codes";
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
                availableSlots: request.maxParticipants,
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

            const sortOptions = {};
            if (sortBy === "price") {
                sortOptions.priceForAdult = sortOrder === "asc" ? 1 : -1;
            } else if (sortBy === "rating") {
                sortOptions.rating = sortOrder === 'asc' ? 1 : -1;
            } else {
                sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
            }

            const tours = await Tour
                .find()
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate("author", "_id username fullName profilePicture ranking rating");

            const totalTours = await Tour.countDocuments();

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalTours,
                    totalPage: Math.ceil(totalTours / limit),
                    currentPage: page,
                    data: tours
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
                .populate("author", "_id username fullName profilePicture ranking rating");

            if (!tour) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Tour not found",
                });
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

            let imageUrls = tour.imageUrls;
            if (req.files && req.files.length > 0) {
                imageUrls = await uploadImages(req.files);
            }

            await Tour.findByIdAndUpdate(
                id,
                { $set: { ...request, schedule: scheduleData, imageUrls } },
                { new: true }
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Tour has been updated",
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

            const tours = await Tour.find({ author: user._id });

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

    // [GET] /api/v1/tours/search?destination=

    // db.tours.createIndex({ destination: "text" })
    async findByDestination(req, res) {
        try {
            const searchQuery = req.query.destination?.trim();
            if (!searchQuery) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Search query is required",
                });
            }

            const formattedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, " ");

            let tours = [];

            tours = await Tour.find(
                { $text: { $search: searchQuery } },
                { score: { $meta: "textScore" } }
            )
                .sort({ score: { $meta: "textScore" } })
                .populate("author", "_id username fullName profilePicture ranking rating");

            if (tours.length === 0) {
                tours = await Tour.find({
                    $or: [
                        { destination: { $regex: formattedQuery, $options: "i" } },
                    ],
                })
                    .populate("author", "_id username fullName profilePicture ranking rating");
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
                .populate("author", "_id username fullName profilePicture ranking rating");

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