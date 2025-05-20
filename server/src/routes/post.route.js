import express from "express";
import postController from "../controllers/post.controller.js";
import { authenticated, authorize, checkOwnerPost } from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import {contentModerationMiddleware} from "../middlewares/contentModerationMiddleware.js";


const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Post
 *   description: API for managing posts
 */

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     description: Allows an authenticated user to create a new post with optional images.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the post.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files for the post.
 *     responses:
 *       201:
 *         description: Post created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a paginated list of all posts.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of posts per page.
 *     responses:
 *       200:
 *         description: A paginated list of posts.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Retrieve a single post by its ID.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post.
 *     responses:
 *       200:
 *         description: The requested post.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update the content and/or images of a post. Only the owner of the post can update it.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the post.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of updated image files for the post.
 *     responses:
 *       200:
 *         description: Post updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (not the owner of the post).
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post by its ID. Only the owner of the post can delete it.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post to delete.
 *     responses:
 *       204:
 *         description: Post deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (not the owner of the post).
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts/like:
 *   post:
 *     summary: Like or unlike a post
 *     description: Toggle like or unlike for a specific post.
 *     tags:
 *       - Post
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
 *                 description: The ID of the post to like or unlike.
 *     responses:
 *       200:
 *         description: Post liked or unliked successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts/re-post:
 *   post:
 *     summary: Re-post a post
 *     description: Re-post an existing post as an authenticated user.
 *     tags:
 *       - Post
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
 *                 description: The ID of the post to re-post.
 *     responses:
 *       200:
 *         description: Post re-posted successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /posts/privacy/{id}:
 *   post:
 *     summary: Set post privacy
 *     description: Update the privacy settings of a post.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the post.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               privacy:
 *                 type: string
 *                 enum: [public, private]
 *                 description: The privacy setting of the post.
 *     responses:
 *       200:
 *         description: Post privacy updated successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (not the owner of the post).
 *       404:
 *         description: Post not found.
 *       500:
 *         description: Internal server error.
 */

// Routes
router.post("/", authenticated, upload.array("images"), contentModerationMiddleware, postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/search", postController.searchPost);
router.get("/hashtag/:hashtag", postController.getPostsByHashtag);
router.get("/hashtags/top", postController.getTopHashtags);
router.get("/profile/:username", postController.getAllPostsByUsername);
router.get("/:id", postController.getPostById);
router.put("/:id", authenticated, upload.array("images"), checkOwnerPost, postController.updatePost);
router.delete("/:id", authenticated, checkOwnerPost, postController.deletePost);
router.post("/like", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), postController.likePost);
router.post("/re-post", authenticated, postController.rePost);
router.post("/privacy/:id", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), checkOwnerPost, postController.setPrivacy);

export default router;