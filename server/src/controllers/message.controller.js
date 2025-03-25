import Message from "../models/message.model.js";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";
import User from "../models/user.model.js";



class MessageContent {
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;

      //Check if chatId and senderId are valid ObjectIds
      if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Invalid chatID.",
        });
      }

      const messages = await Message.find({ chatId })

      res.status(StatusCodes.OK).json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Error retrieving messages"
      });
    }
  };

  async createMessage(req, res) {
    try {
      const { chatId, senderId, content } = req.body;

      const imageUrls = req.files ? await uploadImages(req.files) : [];

      //Check if chatId and senderId are valid ObjectIds
      if (!mongoose.Types.ObjectId.isValid(chatId) || !mongoose.Types.ObjectId.isValid(senderId)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Invalid chatID or senderId.",
        });
      }

      // Check conversation is already exist or not
      const chatExists = await Conversation.findById(chatId);
      if (!chatExists) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "ConversationId does not exist.",
        });
      }

      // Check if the sender exists
      const senderExists = await User.findById(senderId);
      if (!senderExists) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "SenderId does not exist.",
        });
      }

      const message = new Message({ chatId, senderId, content, imageUrls });
      await message.save();

      await Conversation.findByIdAndUpdate(chatId, { lastMessage: message._id });


      res.status(StatusCodes.OK).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error("Error creating/getting message:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Internal server error"
      });
    }
  };


}
export default new MessageContent;

