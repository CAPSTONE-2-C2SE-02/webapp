import amqp from "amqplib";
import Notification from "../models/notification.model.js";

const QUEUE_NAME = "NOTIFICATION_QUEUE";

export const consumeNotifications = async (io) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const notificationData = JSON.parse(msg.content.toString());
                    console.log("📩 Received notification:", notificationData);

                    const { receiverId, type, senderId, relatedId, relatedModel, message } = notificationData;

                    const newNotification = new Notification({
                        type,
                        senderId,
                        receiverId,
                        relatedId,
                        relatedModel,
                        message,
                    });

                    await newNotification.save();

                    const sendNotification = await Notification.findById(newNotification._id)
                        .populate("senderId", "username fullName profilePicture")
                        .populate("relatedId")
                        .sort({ createdAt: -1 });

                    const recipient = global.oneLineUses.find(user => user.userId === receiverId);
                    if (recipient) {
                        io.to(recipient.socketId).emit("new_notification", sendNotification);
                        console.log("🔔 Sent notification to:", receiverId);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("⚠️ Error processing message:", error.message);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error("❌ Error consuming notifications:", error);
        // setTimeout(consumeNotifications, 5000);
        setTimeout(() => consumeNotifications(io), 5000);
    }
};
