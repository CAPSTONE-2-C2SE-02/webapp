import express from "express";
import userController from "../controllers/user.controller.js";
import { authenticated, authorize, checkOwnerUserId, } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/register/traveler", userController.registerTraveller);
router.post("/register/tour-guide", userController.registerTourGuide);
router.get("", authenticated, authorize("ADMIN"), userController.getAllUsers);
router.put("/change-password/:id", authenticated, authorize("TRAVELER", "TOUR_GUIDE"), checkOwnerUserId, userController.changePassword);
router.get("/:id", authenticated, authorize("ADMIN", "TRAVELER", "TOUR_GUIDE"), checkOwnerUserId, userController.findUserById);

export default router;
