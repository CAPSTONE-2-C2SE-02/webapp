import { StatusCodes } from "http-status-codes";
import Role from "../enums/role.enum.js";
import Visibility from "../enums/visibility.enum.js";
import Profile from "../models/profile.model.js";
import Tour from "../models/tour.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";

class TourController {

    // [POST] /api/v1/tours
    async createTour(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }

            const request = req.body;
            const mediaUrls = req.files ? await uploadImages(req.files) : [];

            const newTour = {
                guide: profile._id,
                title: request.title,
                description: request.description,
                location: request.location,
                itinerary: request.itinerary,
                price: request.price,
                maxParticipants: request.maxParticipants,
                startDate: request.startDate,
                endDate: request.endDate,
                duration: request.duration,
                images: mediaUrls,
                visibility: request.visibility,
            };

            await Tour.create(newTour);

            return res.status(StatusCodes.OK).json({
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
            const role = req.user?.role || false;
            let filter = { visibility: Visibility.PUBLIC };
            if (role === Role.ADMIN) {
                filter = {};
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const tours = await Tour.find(filter).skip(skip).limit(limit);
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
            const tour = await Tour.findById(id);

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

            const requestData = req.body;
            let images = tour.images;
            if (req.files && req.files.length > 0) {
                images = await uploadImages(req.files);
            }

            await Tour.findByIdAndUpdate(
                id,
                { $set: { ...requestData, images } },
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
            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }

            const tours = await Tour.find({ guide: profile._id });

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

    // db.tours.createIndex({ location: "text" })
    async findByLocation(req, res) {
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
            );

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