import Message from "../models/message.model.js";
import { StatusCodes } from "http-status-codes";
import Conversation from "../models/conversation.model.js";
import { uploadImages } from "../utils/uploadImage.util.js";
import User from "../models/user.model.js";
import { io } from "../server.js";

class ChatMessage {
  // [POST] /messages
  async sendMessage(req, res) {
    try {
      const { recipient, content, tour } = req.body;
      const imageUrls = req.files?.length ? await uploadImages(req.files) : [];
      const sender = req.user.userId;
      
      const messageType = imageUrls.length ? "image" : tour ? "tour" : "text";

      if (messageType === "text" && (!content && !content.trim())) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          error: "Content is required.",
        });
      }

      const [recipientExists, conversation] = await Promise.all([
        User.findById(recipient).select("_id"),
        Conversation.findOne({ participants: { $all: [sender, recipient] } })
      ]);

      // Check if the recipient exists
      if (!recipientExists) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Recipient does not exist.",
        });
      }

      const message = new Message({
        sender,
        recipient,
        messageType,
        content: content ? content.trim() : "",
        imageUrls: imageUrls.length ? imageUrls : undefined,
        tour: tour || undefined,
      });

      let conversationToUpdate = conversation;
      // check if the conversation exists
      // not exists => create new conversation
      if (!conversationToUpdate) {
        conversationToUpdate = new Conversation({
          participants: [sender, recipient],
          messages: [message._id],
          lastMessage: message._id,
        });
      } else {
        // exists => push new message into messages property and update last message
        conversationToUpdate.lastMessage = message._id;
        conversationToUpdate.messages.push(message._id);
      }

      await Promise.all([
        message.save(),
        conversationToUpdate.save()
      ]);

      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username fullName profilePicture")
        .populate("recipient", "username fullName profilePicture")
        .populate("tour", "title imageUrls introduction priceForAdult duration destination departureLocation");
      
      const userSocket = global.oneLineUses.find(user => user.userId === recipient);
      if (userSocket) {
        io.to(userSocket.socketId).emit("newMessage", populatedMessage);
        console.log("🗨️ Sent message to:", userSocket);
      }
      
      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Message sent successfully",
        result: populatedMessage,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }

  async getMessages(req, res) {
    try {
      const { id: recipientId } = req.params;
      const senderId = req.user.userId;

      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
      })
        .populate({
          path: "messages",
          populate: [
            { path: "sender", select: "username fullName profilePicture" },
            { path: "recipient", select: "username fullName profilePicture" },
            { path: "tour", select: "title imageUrls introduction priceForAdult duration destination departureLocation" }
          ],
          options: { sort: { createdAt: 1 } },
        })
        .populate("participants", "username fullName profilePicture");

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Conversation not found",
        });
      }

      const messages = conversation.messages;

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Messages retrieved successfully",
        result: messages,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  };

  async getConversations(req, res) {
    try {
      const userId = req.user.userId;

      const conversations = await Conversation.find({
        participants: userId,
      })
        .select("participants lastMessage updatedAt")
        .populate({
          path: "participants",
          select: "username fullName profilePicture",
          match: { _id: { $ne: userId } },
        })
        .populate({
          path: "lastMessage",
          select: "content tour imageUrls",
          populate: {
            path: "tour",
            select: "title",
          }
        })
        .sort({ updatedAt: -1 });

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Conversations retrieved successfully",
        result: conversations,
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  };

  // [GET] /messages/:id/media
  async getMediaAndTour(req, res) {
    try {
      const { id: recipientId } = req.params;
      const senderId = req.user.userId;

      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
      }).populate({
        path: "messages",
        match: { messageType: { $in: ["image", "tour"] } },
        select: "messageType imageUrls tour",
        populate: { path: "tour", select: "title" },
        options: { sort: { createdAt: 1 } },
      });

      if (!conversation) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          error: "Conversation not found",
        });
      }

      const images = [];
      const tours = [];

      for (const msg of conversation.messages) {
        if (msg.messageType === "image" && Array.isArray(msg.imageUrls)) {
          images.push(...msg.imageUrls);
        }
        if (msg.messageType === "tour" && msg.tour) {
          let tourObj = { _id: msg.tour._id, title: msg.tour.title };
          tours.push(tourObj);
        }
      }

      return res.status(StatusCodes.OK).json({
        success: true,
        message: "Media retrieved successfully",
        result: { images, tours },
      });
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: error.message,
      });
    }
  }
}
export default new ChatMessage;

