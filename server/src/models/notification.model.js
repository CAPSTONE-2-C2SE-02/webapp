import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";

const NotificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["FOLLOW", "LIKE", "COMMENT", "BOOKING"],
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedModel",
    },
    relatedModel: {
        type: String,
        enum: ["Post", "Tour", "User"],
    },
    message: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

NotificationSchema.plugin(MongooseDelete, { overrideMethods: true, deletedAt: true });

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification;

