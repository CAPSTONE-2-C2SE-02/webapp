import { StatusCodes } from "http-status-codes";
import Role from "../enums/role.enum.js";
import Profile from "../models/profile.model.js";
import RoleModel from "../models/role.model.js";
import User from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.util.js";
import { profileSchema } from "../validations/profile.validation.js";
import { userSchema } from "../validations/user.validation.js";

class UserController {

    //[POST] /api/v1/users/register/traveller
    async registerTraveller(req, res) {
        try {
            const { fullName, email, password, phoneNumber } = req.body;

            const { error: errorUser } = userSchema.validate(
                { password },
                { abortEarly: false }
            );
            if (errorUser) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "User validation error.",
                    errors: errorUser.details.map(err => err.message),
                });
            }

            const { error: errorProfile } = profileSchema.validate(
                { fullName, email, phoneNumber },
                { abortEarly: false }
            );

            if (errorProfile) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Profile validation error.",
                    errors: errorProfile.details.map(err => err.message),
                });
            }

            const username = email.split('@')[0];

            const exitsUser = await Profile.findOne({ $or: [{ email }, { phoneNumber }] })

            if (exitsUser) {
                const errors = [];

                if (exitsUser.email == email)
                    errors.push("Email already exist.")
                if (exitsUser.phoneNumber == phoneNumber)
                    errors.push("Phone number already exist.")

                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: errors });
            }

            const travellerRole = await RoleModel.findOne({ name: Role.TRAVELER });

            if (!travellerRole)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Role not found." });

            const newUser = {
                username: username,
                password: await hashPassword(password),
                role: travellerRole._id
            };

            const userCreated = await User.create(newUser);
            if (userCreated) {
                const newProfile = {
                    userId: userCreated._id,
                    fullName: fullName,
                    email: email,
                    phoneNumber: phoneNumber,
                };
                await Profile.create(newProfile);
                return res.status(StatusCodes.OK).json({ success: true, message: "Traveler account registration successful." });
            }

        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    };

    //[POST] /api/v1/users/register/tour-guide
    async registerTourGuide(req, res) {
        try {
            const { fullName, email, password, phoneNumber } = req.body;

            const { error: errorUser } = userSchema.validate(
                { password },
                { abortEarly: false }
            );
            if (errorUser) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: errorUser.details.map(err => err.message),
                });
            }

            const { error: errorProfile } = profileSchema.validate(
                { fullName, email, phoneNumber },
                { abortEarly: false }
            );

            if (errorProfile) {
                return res.status(400).json({
                    success: false,
                    message: errorProfile.details.map(err => err.message),
                });
            }

            const username = email.split('@')[0];

            const exitsUser = await Profile.findOne({ $or: [{ email }, { phoneNumber }] })

            if (exitsUser) {
                const errors = [];

                if (exitsUser.email == email)
                    errors.push("Email already exist.")
                if (exitsUser.phoneNumber == phoneNumber)
                    errors.push("Phone number already exist.")

                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: errors });
            }

            const tourGuideRole = await RoleModel.findOne({ name: Role.TOUR_GUIDE });

            if (!tourGuideRole)
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Role not found." });

            const newUser = {
                username: username,
                password: await hashPassword(password),
                role: tourGuideRole._id
            };

            const userCreated = await User.create(newUser);
            if (userCreated) {
                const newProfile = {
                    userId: userCreated._id,
                    fullName: fullName,
                    email: email,
                    phoneNumber: phoneNumber,
                };
                await Profile.create(newProfile);
                return res.status(StatusCodes.OK).json({ success: true, message: "Tour guide account registration successful." });
            }

        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    };

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
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    };

    // [PUT] /api/v1/users/change-password/:id
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword, reTypePassword } = req.body;

            const password = oldPassword;
            const { error: errors } = userSchema.validate(
                { password },
                { abortEarly: false }
            );

            if (errors) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: errors.details.map(err => err.message),
                })
            }

            const id = req.params.id;

            const user = await User.findOne({ _id: id });
            if (!user)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "User not found.",
                });

            if (!(await comparePassword(oldPassword, user.password)))
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Old password incorrect."
                });

            if (newPassword != reTypePassword)
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: "Re-type password does not match."
                });

            user.password = await hashPassword(newPassword);

            await user.save();

            return res.json({
                success: true,
                message: "Password updated successfully.",
            });
        } catch (error) {
            console.log(error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
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
                    message: "User not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: user,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
        }
    };
};

export default new UserController;