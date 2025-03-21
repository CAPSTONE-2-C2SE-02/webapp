import Message from "../models/message.model.js";
import { StatusCodes } from "http-status-codes";


class MessageContent {
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;

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
      const message = new Message({ chatId, senderId, content });
      await message.save();

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

