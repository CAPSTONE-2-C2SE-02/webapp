import axios from "axios";
import { StatusCodes } from "http-status-codes";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { uploadSingleImage } from "../utils/uploadImage.util.js";
import notificationController from "./notification.controller.js";

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
            if (existingProfile && existingProfile.phoneNumber) {
                const errors = [];
                if (existingProfile.email === request.email) errors.push("Email already exists.");
                if (existingProfile.phoneNumber === request.phoneNumber) errors.push("Phone number already exists.");

                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: errors });
            }

            // Upload profile picture
            const profilePicture = req.files?.profilePicture
                ? await uploadSingleImage(req.files.profilePicture)
                : user.profilePicture;

            // Upload cover photo
            const coverPhoto = req.files?.coverPhoto
                ? await uploadSingleImage(req.files.coverPhoto)
                : user.coverPhoto;

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
                    profilePicture: profilePicture,
                    coverPhoto: coverPhoto,
                    dateOfBirth: request.dateOfBirth || user.dateOfBirth,
                },
                { new: true }
            ).select("-password -role -googleId");

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Profile updated successfully.",
                result: updatedProfile,
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

    // [POST] /api/v1/profiles/follow/:id
    async followUser(req, res) {
        try {
            const currentUserId = req.user.userId;
            const targetUserId = req.params.id;

            if (currentUserId === targetUserId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "You cannot follow yourself.",
                });
            }

            let targetUser = await User.findById(targetUserId).select("-password");
            if (!targetUser) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });
            }

            const currentUser = await User.findById(currentUserId).select("-password");

            if (targetUser.followers.includes(currentUserId)) {
                // Unfollow
                targetUser.followers = targetUser.followers.filter((id) => id.toString() !== currentUserId);
                currentUser.followings = currentUser.followings.filter((id) => id.toString() !== targetUserId);

                await targetUser.save();
                await currentUser.save();

                // select -password
                targetUser = await User.findById(targetUserId).select("_id username fullName profilePicture role followers").populate("role", "name");

                return res.status(StatusCodes.OK).json({
                    success: true,
                    message: "Unfollowed the user successfully.",
                    result: targetUser,
                });
            } else {
                // Follow
                targetUser.followers.push(currentUserId);
                currentUser.followings.push(targetUserId);

                await targetUser.save();
                await currentUser.save();

                // Send notification
                await notificationController.sendNotification({
                    body: {
                        type: "FOLLOW",
                        senderId: currentUserId,
                        receiverId: targetUserId,
                        relatedId: currentUserId,
                        relatedModel: "User",
                        message: `Người dùng ${currentUserId} đã follow bạn`
                    },
                }, {
                    status: () => ({
                        json: () => { },
                    }),
                });

                // select -password
                targetUser = await User.findById(targetUserId).select("_id username fullName profilePicture role followers").populate("role", "name");

                return res.status(StatusCodes.OK).json({
                    success: true,
                    message: "Followed the user successfully.",
                    result: targetUser,
                });
            }
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/profiles/followers
    async getFollowers(req, res) {
        try {
            const userId = req.user.userId;

            const user = await User.findById(userId).populate({
                path: "followers",
                select: "_id username fullName profilePicture role followers",
                populate: {
                    path: "role", // Populate the role field
                    select: "name", // Select only the name of the role
                },
            });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: user.followers,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/profiles/following
    async getFollowings(req, res) {
        try {
            const userId = req.user.userId;

            const user = await User.findById(userId).populate({
                path: "followings",
                select: "_id username fullName profilePicture role followers",
                populate: {
                    path: "role", // Populate the role field
                    select: "name", // Select only the name of the role
                },
            });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: user.followings,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/profiles/photos
    async getProfilePhotos(req, res) {
        try {
            const username = req.params.username;

            const user = await User.findOne({ username }).select("profilePicture coverPhoto");
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found.",
                });
            }

            const allPhotos = [];

            const posts = await Post.find({ createdBy: user._id }).select("imageUrls");
            const postImages = posts.reduce((acc, post) => {
                return acc.concat(post.imageUrls);
            }, []);

            if (user.profilePicture) allPhotos.push(user.profilePicture);
            if (user.coverPhoto) allPhotos.push(user.coverPhoto);
            if (postImages.length > 0) allPhotos.push(...postImages);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: allPhotos,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }
};

export default new ProfileController;