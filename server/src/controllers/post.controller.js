import { StatusCodes } from "http-status-codes";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";

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

            await Post.create(newPost);

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Post create successfully"
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
                .exec();

            const totalPosts = await Post.countDocuments();
            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalPosts: totalPosts,
                    totalPage: Math.ceil(totalPosts / limit),
                    currentPage: page,
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
            const post = await Post.findOne()
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

            await Post.delete({ _id: id });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Post has been deleted",
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

            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const post = await Post.findOne({ _id: postId });

            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Post not found",
                });
            }

            const index = post.likes.indexOf(user._id);

            if (index === -1) {
                post.likes.push(user._id);
            } else {
                post.likes.splice(index, 1);
            }

            await post.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: index === -1 ? "Post liked" : "Post unliked",
                result: post.likes,
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
            const username = req.params.username;

            const user = await User.findOne({ username });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const posts = await Post.find({ createdBy: user._id })
                .populate("createdBy", "_id username fullName profilePicture")
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
}

export default new PostController;