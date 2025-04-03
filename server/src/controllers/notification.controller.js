import { StatusCodes } from "http-status-codes";
import Notification from "../models/notification.model.js";
import { sendToQueue } from "../services/queue.service.js";
import userController from "./user.controller.js";

class NotificationController {
    // [POST] /api/v1/notifications
    async sendNotification(req, res) {
        try {
            const { type, senderId, receiverId, relatedId, relatedModel, message } = req.body;

            await sendToQueue("NOTIFICATION_QUEUE", { type, senderId, receiverId, relatedId, relatedModel, message });

            res.status(StatusCodes.CREATED).json({ success: true, message: "Notification sent to queue" });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [GET] /api/v1/notifications
    async getNotifications(req, res) {
        try {
            const notifications = await Notification.find({ receiverId: req.user.userId })
                .populate("senderId", "username fullName profilePicture")
                .populate("relatedId")
                .sort({ createdAt: -1 });

            res.status(StatusCodes.OK).json({ success: true, result: notifications });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    };

    // [PUT] /api/v1/notifications/:id/read
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const notification = await Notification.findByIdAndUpdate(
                id,
                { isRead: true },
                { new: true }
            );

            if (!notification) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Notification not found" });
            }

            res.json({ success: true, result: notification, message: "Notification marked as read" });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    // [DELETE] /api/v1/notifications/:id
    async deleteNotification(req, res) {
        try {
            const { id } = req.params;
            const notificationDeleted = await Notification.findOneAndDelete({ _id: id });

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Notification delete successfully",
                result: notificationDeleted,
            })
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }
}

export default new NotificationController;