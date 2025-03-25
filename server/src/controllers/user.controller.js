import { StatusCodes } from "http-status-codes";
import Role from "../enums/role.enum.js";
import RoleModel from "../models/role.model.js";
import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";

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
                .select("-password");

            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: { ...user._doc, role: user.role.name }
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
            const user = await User.findOne({ username: username }).populate("role").select("-password");

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
            const user = await User.findOne({ _id: id }).select("-password");

            if (!user)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: user,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    };
};

export default new UserController;