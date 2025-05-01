import dayjs from "dayjs";
import { StatusCodes } from "http-status-codes";
import notificationController from "../controllers/notification.controller.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import Ranking from "../models/ranking.model.js";
import User from "../models/user.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";
import { updateTourGuideRankingAndRating } from '../services/ranking.service.js';

class PostController {

    // [POST] /api/v1/posts
    async createPost(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }
            const request = req.body;

            const imageUrls = req.files ? await uploadImages(req.files) : [];

            const newPost = {
                createdBy: user._id,
                ...request,
                imageUrls,
            }

            const createdPost = await Post.create(newPost);

            // Cập nhật điểm ranking
            const todayStart = dayjs().startOf('day').toDate();
            const todayEnd = dayjs().endOf('day').toDate();

            const postTodayCount = await Post.countDocuments({
                createdBy: user._id,
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });

            if (postTodayCount <= 5) {
                await Ranking.findOneAndUpdate(
                    { tourGuideId: user._id },
                    { $inc: { postScore: 1 } },
                    { upsert: true }
                );
            }

            const ranking = await Ranking.findOne({ tourGuideId: user._id });

            if (ranking) {
                const {
                    attendanceScore = 0,
                    completionScore = 0,
                    postScore = 0,
                    reviewScore = 0
                } = ranking;

                ranking.totalScore = attendanceScore + completionScore + postScore + reviewScore;
                await ranking.save();
            }
            // Cập nhật điểm ranking cho tour guide
            await updateTourGuideRankingAndRating(user._id);

            const post = await Post.findById(createdPost._id)
                .populate("createdBy", "_id username fullName profilePicture")
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls")
                .sort({ "createdAt": -1 })
                .exec();

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Post create successfully",
                result: post,
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [GET] /api/v1/posts
    async getAllPosts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const posts = await Post.find().skip(skip).limit(limit)
                .populate("createdBy", "_id username fullName profilePicture")
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls")
                .sort({ "createdAt": -1 })
                .exec();

            const totalPosts = await Post.countDocuments();
            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalPosts: totalPosts,
                    totalPage: Math.ceil(totalPosts / limit),
                    currentPage: page,
                    nextPage: page + 1,
                    limit: limit,
                    data: posts
                },
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [GET] /api/v1/posts/:id
    async getPostById(req, res) {
        try {
            const { id } = req.params;
            const post = await Post.findOne({ _id: id })
                .populate("createdBy", "_id username fullName profilePicture")
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls")
                .exec();


            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found",
                })
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: post
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [PUT] /api/v1/posts/:id
    async updatePost(req, res) {
        try {
            const { id } = req.params;

            const post = await Post.findById(id);
            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found",
                });
            }

            const requestData = req.body;

            let imageUrls = post.imageUrls;
            if (req.files && req.files.length > 0) {
                imageUrls = await uploadImages(req.files);
            }

            const updatedPost = await Post.findByIdAndUpdate(
                id,
                {
                    $set: {
                        ...requestData,
                        imageUrls: imageUrls,
                    },
                },
                { new: true }
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Post has been updated",
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }


    // [DELETE] /api/v1/posts
    async deletePost(req, res) {
        try {
            const id = req.params.id;
            const post = await Post.findOne({ _id: id });

            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found",
                })
            }

            const postDeleted = await Post.findOneAndDelete({ _id: id });

            // Xóa tất cả thông báo liên quan đến bài viết
            await Notification.deleteMany({ relatedId: id, relatedModel: "Post" });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Post delete successfully",
                result: postDeleted,
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [POST] /api/v1/posts/like
    async likePost(req, res) {
        try {
            const { postId } = req.body;
            const userId = req.user.userId;

            // validate post id input
            if (!postId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Post ID is required",
                });
            }

            // check if user exists
            const user = await User.findOne({ _id: userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            // check if post exists
            const post = await Post.findOne({ _id: postId });
            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Post not found",
                });
            }

            const isLiked = post.likes.includes(userId);
            const updateOperator = isLiked ? '$pull' : '$addToSet';

            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { [updateOperator]: { likes: userId } },
                { new: true }
            ).populate("likes", "_id username fullName");

            if (!isLiked) {
                // Send notification
                if (userId !== post.createdBy.toString()) {
                    await notificationController.sendNotification({
                        body: {
                            type: "LIKE",
                            senderId: user._id,
                            receiverId: post.createdBy,
                            relatedId: post._id,
                            relatedModel: "Post",
                            message: `User ${user.username} liked your post`,
                        },
                    }, {
                        status: () => ({
                            json: () => { },
                        }),
                    });
                }
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                message: isLiked ? "Post unliked" : "Post liked",
                result: updatedPost.likes,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [PUT] /api/v1/posts/privacy/:id
    async setPrivacy(req, res) {
        try {
            const { id } = req.params;
            const { activeComment } = req.body;

            const post = await Post.findOne({ _id: id });

            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found",
                });
            }

            const postUpdated = await Post.findByIdAndUpdate(
                id,
                {
                    $set: {
                        activeComment: activeComment || post.activeComment
                    }
                }
            );

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Post has been updated",
                result: post,
            });

        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [GET] /api/v1/posts/my-posts
    async getAllMyPosts(req, res) {
        try {
            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const posts = await Post.find({ createdBy: user._id })
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls")
            if (!posts) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found"
                })
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: posts
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [POST] /api/v1/posts/share
    async rePost(req, res) {
        try {
            const { postId, caption, visibility } = req.body;

            const originalPost = await Post.findById(postId);
            if (!originalPost) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found"
                });
            }

            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const newPost = await Post.create({
                createdBy: user._id,
                caption: caption || "",
                sharedFrom: postId,
            });

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Post shared successfully",
                result: newPost,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [GET] /api/v1/posts/search?q=

    // db.posts.createIndex({ hashtag: "text", content: "text" })
    async searchPost(req, res) {
        try {
            const searchQuery = req.query.q?.trim();

            if (!searchQuery) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Search query is required",
                });
            }

            const formattedQuery = searchQuery.replace(/[^a-zA-Z0-9 ]/g, " ");

            let posts = [];

            posts = await Post.find(
                { $text: { $search: searchQuery } },
                { score: { $meta: "textScore" } }
            )
                .sort({ score: { $meta: "textScore" } })
                .populate("createdBy", "_id username fullName profilePicture")
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls");

            if (posts.length === 0) {
                posts = await Post.find({
                    $or: [
                        { content: { $regex: formattedQuery, $options: "i" } },
                        { hashtag: { $regex: formattedQuery, $options: "i" } },
                    ],
                })
                    .populate("createdBy", "_id username fullName profilePicture")
                    .populate("likes", "_id username fullName")
                    .populate("tourAttachment", "_id title destination introduction imageUrls");
            }

            if (posts.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "No posts found matching the search query",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: posts,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/posts/profile/:username
    async getAllPostsByUsername(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const username = req.params.username;

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const posts = await Post.find({ createdBy: user._id }).skip(skip).limit(limit)
                .populate("createdBy", "_id username fullName profilePicture")
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls")
                .sort({ "createdAt": -1 })

            if (!posts) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found"
                })
            }

            const totalPosts = await Post.find({ createdBy: user._id }).countDocuments();

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalPosts: totalPosts,
                    totalPage: Math.ceil(totalPosts / limit),
                    currentPage: page,
                    nextPage: page + 1,
                    limit: limit,
                    data: posts
                }
            })
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [GET] /api/v1/post/hashtag
    async getPostsByHashtag(req, res) {
        try {
            const { hashtag } = req.body;

            if (!hashtag) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Hashtag is required and must be a string.",
                });
            }

            const posts = await Post.find({ hashtag: hashtag })
                .populate("createdBy", "_id username fullName profilePicture")
                .populate("likes", "_id username fullName")
                .populate("tourAttachment", "_id title destination introduction imageUrls")
                .sort({ createdAt: -1 });

            if (posts.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "No posts found with the given hashtag.",
                });
            }

            return res.status(StatusCodes.OK).json({
                success: true,
                result: posts,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }
}

export default new PostController;