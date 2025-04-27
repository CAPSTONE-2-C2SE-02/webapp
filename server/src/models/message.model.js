import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {  
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "tour"],
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
    },
    imageUrls: {
      type: [String],
      required: function () {
        return this.messageType === "image";
      },
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: function () {
        return this.messageType === "tour";
      },
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;
