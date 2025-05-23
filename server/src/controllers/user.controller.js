import { StatusCodes } from "http-status-codes";
import Role from "../enums/role.enum.js";
import RoleModel from "../models/role.model.js";
import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import Post from "../models/post.model.js";

class UserController {

    //[POST] /api/v1/users/register/traveler
    async registerTraveler(req, res) {
        try {
            const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;

            const username = email.split('@')[0];

            const exitsUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });

            if (exitsUser) {
                const errors = [];

                if (exitsUser.email == email)
                    errors.push("Email already exist.")
                if (exitsUser.phoneNumber == phoneNumber)
                    errors.push("Phone number already exist.")

                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: errors });
            }

            const roleTraveler = await RoleModel.findOne({ name: Role.TRAVELER });

            if (!roleTraveler)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Role traveler not found." });

            const newUser = {
                username: username,
                password: await hashPassword(password),
                fullName: fullName,
                email: email,
                phoneNumber: phoneNumber,
                dateOfBirth: dateOfBirth,
                role: roleTraveler._id
            };

            await User.create(newUser);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Traveler account registration successful."
            });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    };

    //[POST] /api/v1/users/register/tour-guide
    async registerTourGuide(req, res) {
        try {
            const { fullName, email, password, phoneNumber, dateOfBirth } = req.body;

            const username = email.split('@')[0];

            const exitsUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });

            if (exitsUser) {
                const errors = [];

                if (exitsUser.email == email)
                    errors.push("Email already exist.")
                if (exitsUser.phoneNumber == phoneNumber)
                    errors.push("Phone number already exist.")

                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: errors });
            }

            const roleTourGuide = await RoleModel.findOne({ name: Role.TOUR_GUIDE });

            if (!roleTourGuide)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Role tour guide not found." });

            const newUser = {
                username: username,
                password: await hashPassword(password),
                fullName: fullName,
                email: email,
                phoneNumber: phoneNumber,
                dateOfBirth: dateOfBirth,
                role: roleTourGuide._id
            };

            await User.create(newUser);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Tour guide account registration successful."
            });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    };

    async getAuthUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.userId })
                .populate("role")
                .populate({
                    path: "followers",
                    select: "_id username fullName profilePicture role followers",
                    populate: {
                        path: "role", // Populate the role field
                        select: "name", // Select only the name of the role
                    },
                })
                .populate({
                    path: "followings",
                    select: "_id username fullName profilePicture role followers",
                    populate: {
                        path: "role", // Populate the role field
                        select: "name", // Select only the name of the role
                    },
                })
                .select("-password");

            // count posts
            const countPosts = await Post.countDocuments({ createdBy: user._id });

            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: { ...user._doc, role: user.role.name, countPosts: countPosts }
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    };

    async getUserByUsername(req, res) {
        try {
            const username = req.params.username;
            const user = await User.findOne({ username: username })
                .populate("role")
                .populate({
                    path: "followers",
                    select: "_id username fullName profilePicture role followers",
                    populate: {
                        path: "role", // Populate the role field
                        select: "name", // Select only the name of the role
                    },
                })
                .populate({
                    path: "followings",
                    select: "_id username fullName profilePicture role followers",
                    populate: {
                        path: "role", // Populate the role field
                        select: "name", // Select only the name of the role
                    },
                })
                .select("-password");

            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                })
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: { ...user._doc, role: user.role.name }
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }

    // [GET] /api/v1/users?page=x&limit=x
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const users = await User.find().select("-password").skip(skip).limit(limit);

            const totalUsers = await User.countDocuments();
            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalUsers: totalUsers,
                    totalPage: Math.ceil(totalUsers / limit),
                    currentPage: page,
                    limit: limit,
                    data: users
                },
            });

        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    };

    // [PUT] /api/v1/users/change-password/:id
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword)
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Full information required",
                });

            const user = await User.findOne({ _id: req.user.userId });
            if (!user)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });

            if (!(await comparePassword(oldPassword, user.password)))
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Old password incorrect."
                });

            user.password = await hashPassword(newPassword);

            await user.save();

            return res.json({
                success: true,
                message: "Password updated successfully.",
            });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    };

    // [GET] /api/v1/users/:id
    async findUserById(req, res) {
        try {
            const id = req.params.id;
            const user = await User.findOne({ _id: id }).select("username fullName profilePicture role").populate("role", "name");

            if (!user)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: { ...user._doc, role: user.role.name },
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    };

    async findUserByIdNoRes(id) {
        try {
            const user = await User.findOne({ _id: id }).select("-password");
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // [GET] /api/v1/users/search?q=
    async searchUser(req, res) {
        try {
            const searchQuery = req.query.q?.trim();
            if (!searchQuery) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Search query is required",
                });
            }

            const formattedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, " ");

            let profiles = await User.find(
                { $text: { $search: searchQuery } },
                { score: { $meta: "textScore" } }
            )
                .select("-password")
                .sort({ score: { $meta: "textScore" } });

            if (profiles.length === 0) {
                profiles = await User.find({
                    $or: [
                        { fullName: { $regex: formattedQuery, $options: "i" } },
                        { username: { $regex: formattedQuery, $options: "i" } }
                    ],
                }).select("-password");
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: profiles,
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }
};

export default new UserController;