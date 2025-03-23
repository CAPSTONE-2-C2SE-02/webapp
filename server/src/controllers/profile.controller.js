import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import { uploadSingleImage } from "../utils/uploadImage.util.js";

class ProfileController {

    // [PUT] /api/v1/profiles/:id
    async updateProfile(req, res) {
        try {
            const id = req.params.id;
            const request = req.body;

            const user = await User.findOne({ _id: id });

            if (!user)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Profile not found.",
                });

            const existingProfile = await User.findOne({
                $or: [{ email: request.email }, { phoneNumber: request.phoneNumber }]
            });
            if (existingProfile) {
                const errors = [];
                if (existingProfile.email === request.email) errors.push("Email already exists.");
                if (existingProfile.phoneNumber === request.phoneNumber) errors.push("Phone number already exists.");

                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: errors });
            }

            const image = req.files ? await uploadSingleImage(req.files) : user.profilePicture;

            const today = new Date();
            const minAgeDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
            if (request.dateOfBirth < minAgeDate) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "You must be at least 13 years old." });
            }

            const updatedProfile = await User.findByIdAndUpdate(
                id,
                {
                    fullName: request.fullName || user.fullName,
                    username: request.username || user.username,
                    email: request.email || user.email,
                    phoneNumber: request.phoneNumber || user.phoneNumber,
                    address: request.address || user.address,
                    bio: request.bio || user.bio,
                    profilePicture: image,
                    dateOfBirth: request.dateOfBirth || user.dateOfBirth,
                },
                { new: true }
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Profile updated successfully.",
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    };

    // [DELETE] /api/v1/profiles/:id (soft-delete)
    async deleteProfile(req, res) {
        try {
            const id = req.params.id;
            const profile = await User.findOne({ _id: id });

            if (!profile)
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found.",
                });

            await User.delete({ _id: profile._id });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Profile has been deleted.",
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    };

    // [PUT] /api/v1/profiles/active/:id
    async activeProfile(req, res) {
        try {
            const { id } = req.body;
            const profile = await User.findOne({ _id: id });

            if (profile.active) {
                profile.active = false;
            } else {
                profile.active = true;
            }

            await User.findByIdAndUpdate(
                id,
                {
                    $set: {
                        active: profile.active
                    }
                }
            )

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Change active profile successfully.",
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    };

    // [GET] /api/v1/profiles/:id
    async getProfileById(req, res) {
        try {
            const id = req.params.id;
            const profile = await User.findOne({ _id: id }).select("-password");

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
                error: error.message
            });
        }
    };

    // [GET] /api/v1/profiles/my-info
    async myInfo(req, res) {
        try {
            const profile = await User.findOne({ _id: req.user.userId }).select("-password");

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
                error: error.message
            });
        }
    };

    // [GET] /api/v1/profiles/search?q=

    // db.users.createIndex({ fullName: "text" }) để tìm kiếm
    async searchProfiles(req, res) {
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
                { $text: { $search: formattedQuery } },
                { score: { $meta: "textScore" } }
            ).select("-password").sort({ score: { $meta: "textScore" } });


            if (profiles.length === 0) {
                const regexPattern = searchQuery.split("").join(".*");
                profiles = await User.find({
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