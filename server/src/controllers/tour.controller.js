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
                imageUrls: imageUrls,
            };

            await Tour.create(newTour);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Tour created successfully"
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const tours = await Tour.find().skip(skip).limit(limit)
                .populate("author", "_id username fullName ranking rating");
            const totalTours = await Tour.countDocuments();

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalTours,
                    totalPage: Math.ceil(totalTours / limit),
                    currentPage: page,
                    limit,
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
                .populate("author", "_id username fullName ranking rating");

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
            const tour = await Tour.findById(id)
                .populate("author", "_id username fullName ranking rating");
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

    // [GET] /api/v1/tours/search?q=

    // db.tours.createIndex({ destination: "text" })
    async findByDestination(req, res) {
        try {
            const searchQuery = req.query.q?.trim();
            if (!searchQuery) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Search query is required",
                });
            }

            const formattedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, " ");
            let tours = await Tour.find(
                { $text: { $search: formattedQuery } }
            ).populate("author", "_id username fullName ranking rating");

            if (tours.length === 0) {
                const regexPattern = searchQuery.split("").join(".*");
                tours = await Tour.find({
                    location: { $regex: regexPattern, $options: "i" },
                });
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
}

export default new TourController();