import express from "express";
import NotificationController from "../controllers/notification.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";

const router = express.Router();

router.post("/", authenticated, NotificationController.sendNotification);
router.get("/", authenticated, NotificationController.getNotifications);
router.put("/:id/read", authenticated, NotificationController.markAsRead);
router.delete("/:id", authenticated, NotificationController.deleteNotification);

export default router;