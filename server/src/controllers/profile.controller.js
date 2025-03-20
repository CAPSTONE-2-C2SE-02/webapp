import { StatusCodes } from "http-status-codes";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { uploadSingleImage } from "../utils/uploadImage.util.js";

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
                error: error
            });
        }
    };

    // [PUT] /api/v1/profiles/:id
    async updateProfile(req, res) {
        try {
            const id = req.params.id;
            const request = req.body;

            const profile = await Profile.findOne({ _id: id });

            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Profile not found.",
                });

            if (request.email != profile.email || request.phoneNumber != profile.phoneNumber) {
                const existingProfile = await Profile.findOne({
                    $or: [{ email: request.email }, { phoneNumber: request.phoneNumber }],
                    _id: { $ne: id }
                });

                if (existingProfile) {
                    const errors = [];
                    if (existingProfile.email === request.email) errors.push("Email already exists.");
                    if (existingProfile.phoneNumber === request.phoneNumber) errors.push("Phone number already exists.");

                    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, errors });
                }
            }

            const image = req.files ? await uploadSingleImage(req.files) : profile.profilePicture;

            const updatedProfile = await Profile.findByIdAndUpdate(
                id,
                {
                    fullName: request.fullName || profile.fullName,
                    email: request.email || profile.email,
                    phoneNumber: request.phoneNumber || profile.phoneNumber,
                    address: request.address || profile.address,
                    bio: request.bio || profile.bio,
                    profilePicture: image,
                },
                { new: true }
            );

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
                    error: "Profile not found.",
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
                error: error
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
                error: error
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
                    error: "Profile not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: profile,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error
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
                    error: "Profile not found.",
                });

            return res.status(StatusCodes.OK).json({
                success: true,
                result: profile,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error
            });
        }
    };

    // [GET] /api/v1/profiles/search?name=

    // db.profiles.createIndex({ fullName: "text" }) để tìm kiếm
    async searchProfiles(req, res) {
        try {
            const searchQuery = req.query.name?.trim();
            if (!searchQuery) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Search query is required",
                });
            }

            const formattedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, " ");
            let profiles = await Profile.find(
                { $text: { $search: formattedQuery } },
                { score: { $meta: "textScore" } }
            ).sort({ score: { $meta: "textScore" } });


            if (profiles.length === 0) {
                const regexPattern = searchQuery.split("").join(".*");
                profiles = await Profile.find({
                    fullName: { $regex: regexPattern, $options: "i" },
                });
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
    };
};

export default new ProfileController;