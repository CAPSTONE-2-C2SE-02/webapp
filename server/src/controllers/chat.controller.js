import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";
import { StatusCodes } from "http-status-codes";


class ChatMessage {
  async getMessages(req, res) {
    try {
      const { conversationId } = req.query;

      if (!conversationId) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "conversationId is required"
        });
      }
      const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).populate("sender receiver");


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

  async sendMessage(req, res) {
    try {
      const { sender, receiver, content } = req.body;

      const message = new Message({ sender, receiver, content });
      await message.save();

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Message send successfully",
        data: message

      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Error sending messages"
      });
    }
  };

  async createOrGetConversation(req, res) {
    try {
      const { user1, user2 } = req.body;

      let conversation = await Conversation.findOne({
        participants: { $all: [user1, user2] }
      });

      if (!conversation) {
        conversation = new Conversation({ participants: [user1, user2] });
        await conversation.save();
      }

      res.status(StatusCodes.OK).json({
        success: true,
        conversationID: conversation._id
      });
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: "Internal server error"
      });
    }
  };


}
export default new ChatMessage;

