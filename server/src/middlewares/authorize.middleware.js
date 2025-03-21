import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import { verifyToken } from "../utils/token.util.js";
import Profile from "../models/profile.model.js";
import Post from "../models/post.model.js";
import Tour from "../models/tour.model.js";
import Comment from "../models/comment.model.js";
import Calendar from "../models/calendar.model.js";

export const authorize = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user || !roles.includes(req.user.role)) {
                return res.status(StatusCodes.FORBIDDEN).json({
                    success: false,
                    error: "You do not have permission to perform this action.",
                });
            }
            return next();
        } catch (error) {
            console.error("Authorize Middleware Error:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: "Internal Server Error",
            });
        }
    };
};

export const authenticated = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                error: "Unauthenticated.",
            });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                error: "Invalid or expired token.",
            });
        }

        req.user = decoded;
        return next();
    } catch (error) {
        console.error("Authenticated Middleware Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

export const checkOwnerUserId = async (req, res, next) => {
    try {
        if (req.user.role === "ADMIN") {
            return next();
        }

        const user = await User.findOne({ _id: req.params.id });

        if (!user || user._id.toString() !== req.user.userId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                error: "You do not have permission to perform this action.",
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

export const checkOwnerProfileId = async (req, res, next) => {
    try {
        if (req.user.role === "ADMIN") {
            return next();
        }

        const profile = await Profile.findOne({ _id: req.params.id });

        if (!profile || profile.userId.toString() !== req.user.userId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                error: "You do not have permission to perform this action.",
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

export const checkOwnerPost = async (req, res, next) => {
    try {
        if (req.user.role === "ADMIN") {
            return next();
        }

        const post = await Post.findOne({ _id: req.params.id });
        const profile = await Profile.findOne({ _id: post.createdBy });

        if (!post || profile.userId.toString() !== req.user.userId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                error: "You do not have permission to perform this action.",
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

export const checkOwnerTour = async (req, res, next) => {
    try {
        if (req.user.role === "ADMIN") {
            return next();
        }

        const tour = await Tour.findOne({ _id: req.params.id });
        const profile = await Profile.findOne({ _id: tour.tourGuideId });

        if (!tour || profile.userId.toString() !== req.user.userId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                error: "You do not have permission to perform this action.",
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

export const checkOwnerComment = async (req, res, next) => {
    try {
        if (req.user.role === "ADMIN") {
            return next();
        }

        const comment = await Comment.findOne({ _id: req.params.id });
        const profile = await Profile.findOne({ _id: comment.profileId });

        if (!comment || !profile || profile.userId.toString() !== req.user.userId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                error: "You do not have permission to perform this action.",
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};

export const checkOwnerCalendar = async (req, res, next) => {
    try {
        const calendar = await Calendar.findOne({ _id: req.params.id });
        const profile = await Profile.findOne({ _id: calendar.tourGuideId });

        if (!calendar || !profile || profile.userId.toString() !== req.user.userId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                error: "You do not have permission to perform this action.",
            });
        }

        next();
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: error.message || "Internal Server Error",
        });
    }
};
