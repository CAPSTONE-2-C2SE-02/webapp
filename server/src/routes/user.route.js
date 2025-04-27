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
 * /users/register/traveler:
 *   post:
 *     summary: Register a new traveler
 *     description: Register a new traveler account with the required details.
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
 *                 description: The name of the traveler
 *               email:
 *                 type: string
 *                 description: The email of the traveler
 *               password:
 *                 type: string
 *                 description: The password of the traveler
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the traveler
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the traveler
 *     responses:
 *       201:
 *         description: Traveler registered successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /users/register/tour-guide:
 *   post:
 *     summary: Register a new tour guide
 *     description: Register a new tour guide account with the required details.
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
 *                 description: The name of the tour guide
 *               email:
 *                 type: string
 *                 description: The email of the tour guide
 *               password:
 *                 type: string
 *                 description: The password of the tour guide
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the tour guide
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 description: The date of birth of the tour guide
 *     responses:
 *       201:
 *         description: Tour guide registered successfully
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

router.post("/register/traveler", validate(userSchema), userController.registerTraveler);
router.post("/register/tour-guide", validate(userSchema), userController.registerTourGuide);
router.get("", authenticated, authorize("ADMIN"), userController.getAllUsers);
router.get("/auth-user", authenticated, userController.getAuthUser);
router.get("/profile/:username", userController.getUserByUsername);
router.put("/change-password", authenticated, authorize("TRAVELER", "TOUR_GUIDE"), userController.changePassword);
router.get("/:id", authenticated, userController.findUserById);

export default router;
