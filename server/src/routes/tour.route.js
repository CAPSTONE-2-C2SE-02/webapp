import express from "express";
import tourController from "../controllers/tour.controller.js";
import { authenticated, authorize, checkOwnerTour, optionalAuth } from "../middlewares/authorize.middleware.js";
import upload from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import tourSchema from "../validations/tour.validation.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tour
 *   description: API for managing tours
 */

/**
 * @swagger
 * /tours:
 *   post:
 *     summary: Create a new tour
 *     description: Allows a tour guide to create a new tour.
 *     tags:
 *       - Tour
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the tour.
 *               description:
 *                 type: string
 *                 description: The description of the tour.
 *               priceForAdult:
 *                 type: number
 *                 description: Price for adults.
 *               priceForYoung:
 *                 type: number
 *                 description: Price for youths.
 *               priceForChildren:
 *                 type: number
 *                 description: Price for children.
 *               maxParticipants:
 *                 type: number
 *                 description: Maximum number of participants.
 *               destination:
 *                 type: string
 *                 description: The destination of the tour.
 *               schedule:
 *                 type: string
 *                 description: JSON string representing the schedule of the tour.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Images for the tour.
 *     responses:
 *       201:
 *         description: Tour created successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /tours:
 *   get:
 *     summary: Get all tours
 *     description: Retrieve a list of all tours.
 *     tags:
 *       - Tour
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field (e.g., "price", "rating").
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (ascending or descending).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of tours per page.
 *     responses:
 *       200:
 *         description: A list of tours.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTours:
 *                   type: integer
 *                   description: Total number of tours.
 *                 totalPage:
 *                   type: integer
 *                   description: Total number of pages.
 *                 currentPage:
 *                   type: integer
 *                   description: Current page number.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tour'
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /tours/{id}:
 *   get:
 *     summary: Get a tour by ID
 *     description: Retrieve a single tour by its ID.
 *     tags:
 *       - Tour
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour.
 *     responses:
 *       200:
 *         description: The requested tour.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tour'
 *       404:
 *         description: Tour not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /tours/{id}:
 *   put:
 *     summary: Update a tour
 *     description: Update a tour's details. Only the owner of the tour with the "TOUR_GUIDE" role can update it.
 *     tags:
 *       - Tour
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the tour.
 *               description:
 *                 type: string
 *                 description: The updated description of the tour.
 *               priceForAdult:
 *                 type: number
 *                 description: Updated price for adults.
 *               priceForYoung:
 *                 type: number
 *                 description: Updated price for youths.
 *               priceForChildren:
 *                 type: number
 *                 description: Updated price for children.
 *               maxParticipants:
 *                 type: number
 *                 description: Updated maximum number of participants.
 *               destination:
 *                 type: string
 *                 description: Updated destination of the tour.
 *               schedule:
 *                 type: string
 *                 description: JSON string representing the updated schedule of the tour.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Updated images for the tour.
 *     responses:
 *       200:
 *         description: Tour updated successfully.
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (not the owner of the tour).
 *       404:
 *         description: Tour not found.
 */

/**
 * @swagger
 * /tours/{id}:
 *   delete:
 *     summary: Delete a tour
 *     description: Delete a tour by its ID. Only the owner of the tour with the "TOUR_GUIDE" role can delete it.
 *     tags:
 *       - Tour
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tour to delete.
 *     responses:
 *       204:
 *         description: Tour deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (not the owner of the tour).
 *       404:
 *         description: Tour not found.
 */

/**
 * @swagger
 * /tours/my-tours:
 *   get:
 *     summary: Get my tours
 *     description: Retrieve a list of tours created by the authenticated user. Only users with the "TOUR_GUIDE" role can access this endpoint.
 *     tags:
 *       - Tour
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of the user's tours.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 *       401:
 *         description: Unauthorized.
 */

/**
 * @swagger
 * /tours/search:
 *   get:
 *     summary: Search tours by destination
 *     description: Search for tours based on the destination.
 *     tags:
 *       - Tour
 *     parameters:
 *       - in: query
 *         name: destination
 *         schema:
 *           type: string
 *         description: The destination to search for.
 *     responses:
 *       200:
 *         description: A list of matching tours.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 */

/**
 * @swagger
 * /tours/profile/{username}:
 *   get:
 *     summary: Get all tours by username
 *     description: Retrieve a list of all tours created by a specific user.
 *     tags:
 *       - Tour
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the tour creator.
 *     responses:
 *       200:
 *         description: A list of tours created by the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tour'
 *       404:
 *         description: User not found.
 */

// Routes
router.post("/", authenticated, upload.array("images"), authorize("TOUR_GUIDE"), validate(tourSchema), tourController.createTour);
router.get("/", tourController.getAllTours);
router.get("/my-tours", authenticated, authorize("TOUR_GUIDE"), tourController.getMyTours);
router.get("/profile/:username", tourController.getAllToursByUsername);
router.get("/search", tourController.findByDestination);
router.get("/:id", optionalAuth, tourController.getTourById);
router.put("/:id", authenticated, upload.array("images"), authorize("TOUR_GUIDE"), validate(tourSchema), checkOwnerTour, tourController.updateTour);
router.delete("/:id", authenticated, authorize("TOUR_GUIDE"), checkOwnerTour, tourController.deleteTour);

export default router;