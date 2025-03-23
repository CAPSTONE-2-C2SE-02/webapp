import express from "express";
import postController from "../controllers/post.controller.js";
import { authenticated, authorize, checkOwnerPost } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';
import { validateFormData } from "../middlewares/validate.middleware.js";
import postSchema from "../validations/post.validation.js";

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
 *     description: Create a new post with content and optional images.
 *     tags:
 *       - Post
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
 *                 description: Array of image files
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticated, upload.array("images"), validateFormData(postSchema), postController.createPost);

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
router.get("/", postController.getAllPosts);

/**
 * @swagger
 * /posts/my-post:
 *   get:
 *     summary: Get all my posts
 *     description: Retrieve a list of posts created by the authenticated user.
 *     tags:
 *       - Post
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized
 */
router.get("/my-post", authenticated, postController.getAllMyPosts);

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
router.get("/:id", postController.getPostById);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     description: Update a post's content and/or images.
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
 *                 description: Array of updated image files
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
router.put("/:id", authenticated, upload.array("images"), validateFormData(postSchema), checkOwnerPost, postController.updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Delete a post by its ID.
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
router.delete("/:id", authenticated, checkOwnerPost, postController.deletePost);

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
router.post("/like", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), postController.likePost);

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
router.post("/re-post", authenticated, postController.rePost);

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
router.post("/privacy/:id", authenticated, authorize("TOUR_GUIDE", "TRAVELER"), checkOwnerPost, postController.setPrivacy);

export default router;