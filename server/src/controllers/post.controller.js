import { StatusCodes } from "http-status-codes";
import Role from "../enums/role.enum.js";
import Visibility from "../enums/visibility.enum.js";
import Post from "../models/post.model.js";
import Profile from "../models/profile.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";

class PostController {

    // [POST] /api/v1/posts
    async createPost(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }
            const request = req.body;

            const mediaUrls = req.files ? await uploadImages(req.files) : [];

            const newPost = {
                createdBy: profile._id,
                hashtag: request.hashtag,
                taggedUser: request.taggedUser,
                content: request.content,
                location: request.location,
                mediaUrls: mediaUrls,
                visibility: request.visibility,
                activeComment: request.activeComment,
                tourId: request.tourId
            }

            await Post.create(newPost);

            return res.status(StatusCodes.OK).json({
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
            const role = req.user?.role || false;
            let filter = { visibility: Visibility.PUBLIC };
            if (role == Role.ADMIN) {
                filter = {};
            }

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            const posts = (await Post.find(filter).skip(skip).limit(limit));

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
            const role = req.user?.role || false;
            const id = req.params.id;
            const filter = { _id: id };
            if (role !== Role.ADMIN) {
                filter.visibility = Visibility.PUBLIC;
            }

            const post = await Post.findOne(filter);

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

            let mediaUrls = post.mediaUrls;
            if (req.files && req.files.length > 0) {
                mediaUrls = await uploadImages(req.files);
            }

            const updatedPost = await Post.findByIdAndUpdate(
                id,
                {
                    $set: {
                        hashtag: requestData.hashtag || post.hashtag,
                        taggedUser: requestData.taggedUser || post.taggedUser,
                        content: requestData.content || post.content,
                        location: requestData.location || post.location,
                        visibility: requestData.visibility || post.visibility,
                        activeComment: requestData.activeComment || post.activeComment,
                        mediaUrls: mediaUrls,
                        tourId: requestData.tourId
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

    // [POST] /api/v1/post/like
    async likePost(req, res) {
        try {
            const { postId } = req.body;

            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }

            const post = await Post.findOne({ _id: postId });

            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    message: "Post not found",
                });
            }

            const index = post.likedBy.indexOf(profile._id);

            if (index === -1) {
                post.likedBy.push(profile._id);
            } else {
                post.likedBy.splice(index, 1);
            }

            await post.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: index === -1 ? "Post liked" : "Post unliked",
                result: post.likedBy,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            })
        }
    }

    // [PUT] /api/v1/post/privacy/:id
    async setPrivacy(req, res) {
        try {
            const { id } = req.params;
            const { visibility, activeComment } = req.body;

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
                        visibility: visibility || post.visibility,
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

    // [GET] /api/v1/post/my-posts
    async getAllMyPosts(req, res) {
        try {
            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }

            const posts = await Post.find({ createdBy: profile._id });
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

            const profile = await Profile.findOne({ userId: req.user.userId });
            if (!profile) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Profile not found",
                });
            }

            const newPost = await Post.create({
                createdBy: profile._id,
                content: "",
                caption: caption || "",
                mediaUrls: [],
                sharedFrom: postId,
                visibility: visibility || Visibility.PUBLIC,
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
}

export default new PostController;