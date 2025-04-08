import checkinController from "../controllers/checkin.controller.js";
import { authenticated, authorize } from "../middlewares/authorize.middleware.js"
import express from "express";

const router = express.Router();

router.post("/", authenticated, authorize("TOUR_GUIDE"), checkinController.checkinToday);
router.get("/", authenticated, checkinController.getCheckins);

export default router;