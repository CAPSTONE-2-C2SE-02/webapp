import express from "express";
import profileController from "../controllers/profile.controller.js";
import { authenticated, authorize, checkOwnerProfileId } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.get("/", authenticated, authorize("ADMIN"), profileController.getAllProfiles);
router.put("/:id", authenticated, checkOwnerProfileId, profileController.updateProfile);
router.delete("/:id", authenticated, checkOwnerProfileId, profileController.deleteProfile);
router.post("/active", authenticated, authorize("ADMIN"), profileController.activeProfile);
router.get("/myInfo", authenticated, profileController.myInfo);
router.get("/search", profileController.searchProfiles);
router.get("/:id", profileController.getProfileById);

export default router;