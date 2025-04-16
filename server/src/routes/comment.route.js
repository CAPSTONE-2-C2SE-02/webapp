import express from "express";
import commentController from "../controllers/comment.controller.js";
import { authenticated, checkOwnerComment } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import commentSchema from "../validations/comment.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: API for managing comments on posts
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a comment
 *     description: Add a new comment to a post. Optionally, specify a parent comment to create a reply.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post to comment on.
 *               content:
 *                 type: string
 *                 description: The content of the comment.
 *               parentComment:
 *                 type: string
 *                 description: The ID of the parent comment (if replying to a comment).
 *     responses:
 *       201:
 *         description: Comment created successfully.
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Post or user not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Get comments for a post
 *     description: Retrieve all comments for a specific post, including nested replies.
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to retrieve comments for.
 *     responses:
 *       200:
 *         description: Comments retrieved successfully.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     description: Update the content of an existing comment.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the comment.
 *     responses:
 *       200:
 *         description: Comment updated successfully.
 *       404:
 *         description: Comment not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     description: Delete a comment by its ID.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the comment to delete.
 *     responses:
 *       200:
 *         description: Comment deleted successfully.
 *       404:
 *         description: Comment not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /comments/like:
 *   post:
 *     summary: Like or unlike a comment
 *     description: Toggle like or unlike for a specific comment.
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commentId:
 *                 type: string
 *                 description: The ID of the comment to like or unlike.
 *     responses:
 *       200:
 *         description: Comment liked or unliked successfully.
 *       404:
 *         description: Comment or user not found.
 *       500:
 *         description: Internal server error.
 */

// Routes
router.post("/", authenticated, validate(commentSchema), commentController.createComment);
router.get("/:postId", commentController.getCommentsByPost);
router.put("/:id", authenticated, validate(commentSchema), checkOwnerComment, commentController.updateComment);
router.delete("/:id", authenticated, commentController.deleteComment);
router.post("/like", authenticated, commentController.likeComment);

export default router;
