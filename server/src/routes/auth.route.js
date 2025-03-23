import express from "express";

import authenticationController from "../controllers/authentication.controller.js";

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticate a user with email and password.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The email of the user
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/introspect:
 *   post:
 *     summary: Token introspection
 *     description: Validate and retrieve information about an access token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The access token to introspect
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 active:
 *                   type: boolean
 *                   description: Whether the token is active
 *                 userId:
 *                   type: string
 *                   description: The ID of the user associated with the token
 *       401:
 *         description: Invalid or expired token
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User logout
 *     description: Log out the authenticated user and invalidate their tokens.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to invalidate
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /auth/login-google:
 *   post:
 *     summary: Google login
 *     description: Authenticate a user using their Google account.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The Google OAuth token
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The access token for the user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the user
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid Google token
 */

const router = express.Router();

router.post("/login", authenticationController.login);
router.post("/introspect", authenticationController.introspect);
router.post("/logout", authenticationController.logout);
router.post('/login-google', authenticationController.loginGoogle);

export default router;