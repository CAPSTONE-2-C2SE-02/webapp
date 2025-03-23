import express from "express";
import userController from "../controllers/user.controller.js";
import { authenticated, authorize, checkOwnerUserId, } from "../middlewares/authorize.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { userSchema } from "../validations/user.validation.js";

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API for managing users
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the required details.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *               role:
 *                 type: string
 *                 enum: [TRAVELER, TOUR_GUIDE]
 *                 description: The role of the user
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users. Only accessible by admins.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not an admin)
 */

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change user password
 *     description: Change the password of the authenticated user. Only accessible by travelers and tour guides.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: The current password of the user
 *               newPassword:
 *                 type: string
 *                 description: The new password of the user
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a user by their ID. Accessible by admins, travelers, and tour guides. Travelers and tour guides can only access their own profile.
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: The requested user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not the owner or an admin)
 *       404:
 *         description: User not found
 */

const router = express.Router();

router.post("/register", validate(userSchema), userController.register);
router.get("", authenticated, authorize("ADMIN"), userController.getAllUsers);
router.put("/change-password", authenticated, authorize("TRAVELER", "TOUR_GUIDE"), userController.changePassword);
router.get("/:id", authenticated, authorize("ADMIN", "TRAVELER", "TOUR_GUIDE"), checkOwnerUserId, userController.findUserById);

export default router;
