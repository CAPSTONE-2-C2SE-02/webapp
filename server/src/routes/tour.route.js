import express from "express";
import tourController from "../controllers/tour.controller.js";
import { authenticated, authorize, checkOwnerTour } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';
import { validateFormData } from "../middlewares/validate.middleware.js";
import tourSchema from "../validations/tour.validation.js";

const router = express.Router();

router.post("/", authenticated, upload.array("images"), authorize("TOUR_GUIDE"), validateFormData(tourSchema), tourController.createTour);
router.get("/", tourController.getAllTours);
router.get("/my-tours", authenticated, authorize("TOUR_GUIDE"), tourController.getMyTours);
router.get("/search", tourController.findByLocation);
router.get("/:id", tourController.getTourById);
router.put("/:id", authenticated, upload.array("images"), authorize("TOUR_GUIDE"), validateFormData(tourSchema), checkOwnerTour, tourController.updateTour);
router.delete("/:id", authenticated, authorize("TOUR_GUIDE"), checkOwnerTour, tourController.deleteTour);


export default router;