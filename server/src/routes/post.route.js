import express from "express";
import postController from "../controllers/post.controller.js";
import { authenticated, authorize, checkOwnerPost } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';

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
 *     description: Create a new post with content and optional images. Only authenticated users can create posts.
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
 *                 description: The content of the post
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of image files for the post
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieve a list of all posts.
 *     tags:
 *       - Post
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Search posts
 *     description: Search for posts by content or hashtags.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: The search query
 *     responses:
 *       200:
 *         description: A list of matching posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Validation error
 *       404:
 *         description: No posts found
 */

/**
 * @swagger
 * /posts/profile/{username}:
 *   get:
 *     summary: Get all posts by username
 *     description: Retrieve a list of all posts created by a specific user.
 *     tags:
 *       - Post
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the post creator
 *     responses:
 *       200:
 *         description: A list of posts created by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       404:
 *         description: User not found
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
 *         description: The ID of the post
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update a post's content and/or images. Only the owner of the post can update it.
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
 *         description: The ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The updated content of the post
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of updated image files for the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner of the post)
 *       404:
 *         description: Post not found
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
 *         description: The ID of the post to delete
 *     responses:
 *       204:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner of the post)
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts/like:
 *   post:
 *     summary: Like a post
 *     description: Like a post as an authenticated user.
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
 *                 description: The ID of the post to like
 *     responses:
 *       200:
 *         description: Post liked successfully
 *       401:
 *         description: Unauthorized
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
 *                 description: The ID of the post to re-post
 *     responses:
 *       200:
 *         description: Post re-posted successfully
 *       401:
 *         description: Unauthorized
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
 *         description: The ID of the post
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
 *                 description: The privacy setting of the post
 *     responses:
 *       200:
 *         description: Post privacy updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner of the post)
 *       404:
 *         description: Post not found
 */

const router = express.Router();

router.post("/", authenticated, upload.array("images"), postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/search", postController.searchPost);
router.get("/hashtag", postController.getPostsByHashtag);
router.get("/profile/:username", postController.getAllPostsByUsername);
router.get("/:id", postController.getPostById);
router.put("/:id", authenticated, upload.array("images"), checkOwnerPost, postController.updatePost);
router.delete("/:id", authenticated, checkOwnerPost, postController.deletePost);
router.post("/like", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), postController.likePost);
router.post("/re-post", authenticated, postController.rePost);
router.post("/privacy/:id", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), checkOwnerPost, postController.setPrivacy);

export default router;