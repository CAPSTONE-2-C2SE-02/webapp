import { StatusCodes } from "http-status-codes";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { decodeToken } from "../utils/token.util.js";
import { profileSchema } from "../validations/profile.validation.js";

class ProfileController {

    // [GET] /api/v1/profiles?page=&limit=
    async getAllProfiles(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const profiles = await Profile.find().skip(skip).limit(limit);

            const totalProfiles = await Profile.countDocuments();
            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalProfiles: totalProfiles,
                    totalPage: Math.ceil(totalProfiles / limit),
                    currentPage: page,
                    limit: limit,
                    data: profiles
                },
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error
            });
        }
    };

    // [PUT] /api/v1/profiles/:id
    async updateProfile(req, res) {
        try {
            const id = req.params.id;
            const { fullName, email, phoneNumber, address, bio, profilePicture } = req.body;

            const { error: errors } = profileSchema.validate(
                { fullName, email, phoneNumber },
                { abortEarly: false }
            );

            if (errors) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    message: errors.details.map(err => err.message),
                });
            }

            const profile = await Profile.findOne({ _id: id });

            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Profile not found.",
                });

            const exitsProfile = await Profile.findOne({ $or: [{ email }, { phoneNumber }] })
            if (exitsProfile) {
                const errors = [];
                if (exitsProfile.email == email)
                    errors.push("Email already exist.")
                if (exitsProfile.phoneNumber == phoneNumber)
                    errors.push("Phone number already exist.")
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: errors });
            }

            profile.fullName = fullName || profile.fullName;
            profile.email = email || profile.email;
            profile.phoneNumber = phoneNumber || profile.phoneNumber;
            profile.address = address || profile.address;
            profile.bio = bio || profile.bio;
            profile.profilePicture = profilePicture || profile.profilePicture;

            await profile.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Profile updated successfully.",
                result: profile,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error
            });
        }
    };

    // [DELETE] /api/v1/profiles/:id (soft-delete)
    async deleteProfile(req, res) {
        try {
            const id = req.params.id;
            const profile = await Profile.findOne({ _id: id });

            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Profile not found.",
                });

            await Profile.delete({ _id: profile._id });
            await User.delete({ _id: profile.userId })

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Profile has been deleted.",
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error
            });
        }
    };

    // [POST] /api/v1/profiles/active/:id
    async activeProfile(req, res) {
        try {
            const { id } = req.body;
            const profile = await Profile.findOne({ _id: id });

            if (profile.active) {
                profile.active = false;
            } else {
                profile.active = true;
            }

            await profile.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Change active profile successfully.",
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error
            });
        }
    };

    // [GET] /api/v1/profiles/:id
    async getProfileById(req, res) {
        try {
            const id = req.params.id;
            const profile = await Profile.findOne({ _id: id });

            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Profile not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: profile,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error
            });
        }
    };

    // [GET] /api/v1/profiles/:id
    async myInfo(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user.userId });

            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Profile not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: profile,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error
            });
        }
    };
};

export default new ProfileController;