import { StatusCodes } from "http-status-codes";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import NotificationController from "./notification.controller.js";
import Comment from "../models/comment.model.js";

class CommentController {
    // [POST] /api/v1/comments
    async createComment(req, res) {
        try {
            const { postId, content, parentComment } = req.body;

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Post not found" });
            }

            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const userId = user._id;

            const newComment = new Comment({
                postId,
                author: userId,
                content,
                parentComment,
            });

            await newComment.save();

            if (parentComment) {
                await Comment.findByIdAndUpdate(parentComment, {
                    $push: { childComments: newComment._id },
                })
            }

            // Send notification
            if (user._id.toString() != post.createdBy.toString()) {
                await NotificationController.sendNotification({
                    body: {
                        type: "COMMENT",
                        senderId: user._id,
                        receiverId: post.createdBy,
                        relatedId: post._id,
                        relatedModel: "Post",
                        message: `User ${user.username} commented on your post`,
                    },
                }, {
                    status: () => ({
                        json: () => { },
                    }),
                });
            }

            return res.status(StatusCodes.CREATED).json({
                success: true,
                message: "Comment added successfully",
                result: newComment
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [GET] /api/v1/comments/:postId
    async getCommentsByPost(req, res) {
        try {
            const { postId } = req.params;

            const populateComments = async (comments) => {
                const populatedComments = await Comment.populate(comments, [
                    {
                        path: 'author',
                        select: 'username fullName profilePicture'
                    },
                    {
                        path: 'likes',
                        select: 'username fullName'
                    },
                    {
                        path: 'childComments',
                        populate: {
                            path: 'author',
                            select: 'username fullName profilePicture'
                        }
                    }
                ]);

                // Đệ quy populate cho các childComments
                for (let comment of populatedComments) {
                    if (comment.childComments && comment.childComments.length > 0) {
                        comment.childComments = await populateComments(comment.childComments);
                        // Sắp xếp childComments theo thời gian tạo
                        comment.childComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    }
                }

                return populatedComments;
            };

            const rootComments = await Comment.find({ postId, parentComment: null })
                .sort({ createdAt: -1 });

            // Populate đệ quy cho tất cả comments
            const populatedComments = await populateComments(rootComments);

            return res.status(StatusCodes.OK).json({
                success: true,
                result: populatedComments
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [PUT] /api/v1/comments/:id
    async updateComment(req, res) {
        try {
            const { id } = req.params;
            const { content } = req.body;

            const comment = await Comment.findById(id);
            if (!comment) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Comment not found",
                });
            }

            comment.content = content;
            await comment.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Comment updated successfully",
                result: comment,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [DELETE] /api/v1/comments/:id
    async deleteComment(req, res) {
        try {
            const { id } = req.params;

            const comment = await Comment.findById(id);
            if (!comment) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: "Comment not found" });
            }

            await Comment.findByIdAndDelete(id);
            return res.status(StatusCodes.OK).json({ success: true, message: "Comment deleted successfully" });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
        }
    }

    // [POST] /api/v1/comments/like
    async likeComment(req, res) {
        try {
            const { commentId } = req.body;

            const user = await User.findOne({ _id: req.user.userId });
            if (!user) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "User not found",
                });
            }

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Comment not found",
                });
            }

            const index = comment.likes.indexOf(user._id);
            if (index === -1) {
                comment.likes.push(user._id);
            } else {
                comment.likes.splice(index, 1);
            }

            await comment.save();

            return res.status(StatusCodes.OK).json({
                success: true,
                message: index === -1 ? "Comment liked" : "Comment unliked",
                result: comment.likes,
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message,
            });
        }
    }

    // [GET] /api/v1/comments/:postId/count
    async getCommentCount(req, res) {
        try {
            const { postId } = req.params;

            const post = await Post.findById(postId);
            if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "Post not found"
                });
            }

            // Đếm tổng số comment (bao gồm cả reply)
            const totalComments = await Comment.countDocuments({ postId });

            // Đếm số comment gốc (không có parent)
            const rootComments = await Comment.countDocuments({
                postId,
                parentComment: null
            });

            // Đếm số reply (có parent)
            const replyComments = totalComments - rootComments;

            return res.status(StatusCodes.OK).json({
                success: true,
                result: {
                    totalComments,
                    rootComments,
                    replyComments
                }
            });
        } catch (error) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: error.message
            });
        }
    }
}

export default new CommentController();