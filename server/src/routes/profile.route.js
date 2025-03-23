import express from "express";
import profileController from "../controllers/profile.controller.js";
import { authenticated, authorize, checkOwnerUserId } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';
import { validate } from "../middlewares/validate.middleware.js";
import { profileSchema } from "../validations/profile.validation.js";

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: API for managing user profiles
 */

/**
 * @swagger
 * /profiles/{id}:
 *   put:
 *     summary: Update a user profile
 *     description: Update the profile of a user by ID. Only the owner or an authorized user can update the profile.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user profile to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               bio:
 *                 type: string
 *                 description: A short bio of the user
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Profile image files
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner of the profile)
 *       404:
 *         description: Profile not found
 */

/**
 * @swagger
 * /profiles/{id}:
 *   delete:
 *     summary: Delete a user profile
 *     description: Delete a user profile by ID. Only the owner or an authorized user can delete the profile.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user profile to delete
 *     responses:
 *       204:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner of the profile)
 *       404:
 *         description: Profile not found
 */

/**
 * @swagger
 * /profiles/active:
 *   post:
 *     summary: Activate a user profile
 *     description: Activate a user profile. Only admins can perform this action.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user profile to activate
 *     responses:
 *       200:
 *         description: Profile activated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not an admin)
 */

/**
 * @swagger
 * /profiles/myInfo:
 *   get:
 *     summary: Get my profile information
 *     description: Retrieve the profile information of the authenticated user.
 *     tags:
 *       - Profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The profile information of the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /profiles/search:
 *   get:
 *     summary: Search user profiles
 *     description: Search for user profiles based on query parameters.
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: The name of the user to search for
 *       - in: query
 *         name: bio
 *         schema:
 *           type: string
 *         description: A keyword to search in user bios
 *     responses:
 *       200:
 *         description: A list of matching user profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Profile'
 */

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Get a user profile by ID
 *     description: Retrieve a user profile by its ID.
 *     tags:
 *       - Profile
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user profile to retrieve
 *     responses:
 *       200:
 *         description: The requested user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profile'
 *       404:
 *         description: Profile not found
 */

const router = express.Router();

router.put("/:id", authenticated, upload.array("image"), validate(profileSchema), checkOwnerUserId, profileController.updateProfile);
router.delete("/:id", authenticated, checkOwnerUserId, profileController.deleteProfile);
router.post("/active", authenticated, authorize("ADMIN"), profileController.activeProfile);
router.get("/myInfo", authenticated, profileController.myInfo);
router.get("/search", profileController.searchProfiles);
router.get("/:id", profileController.getProfileById);

export default router;