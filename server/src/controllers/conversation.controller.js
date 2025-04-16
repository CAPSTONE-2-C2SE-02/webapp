import { StatusCodes } from "http-status-codes";
import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
import User from "../models/user.model.js";



class ChatBox {
    async getUserConversation(req, res) {
        try {
            const userId = req.params._id;

            // Check valid ID
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Id is not valid."
                });
            }


            const conversation = await Conversation.find({ members: { $in: [userId] } })
                .populate({
                    path: "lastMessage",
                    select: "content senderId imageUrls fileUrls createdAt",
                });

            res.status(StatusCodes.OK).json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: "Error retrieving conversations"
            });
        }
    };

    async findConversation(req, res) {
        try {
            const { firstId, secondId } = req.params;

            // Check valid ID
            if (!mongoose.Types.ObjectId.isValid(firstId) || !mongoose.Types.ObjectId.isValid(secondId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Id is not valid."
                });
            }

            //Check if the two users exist
            const user1 = await User.findById(firstId);
            const user2 = await User.findById(secondId);
            if (!user1 || !user2) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "One or both users not found."
                });
            }


            const conversation = await Conversation.findOne({
                members: { $all: [firstId, secondId] }
            })
                .populate({
                    path: "lastMessage",
                    select: "content senderId imageUrls fileUrls createdAt",
                });

            res.status(StatusCodes.OK).json({
                success: true,
                data: conversation
            });
        } catch (error) {
            console.error("Error fetching conversations:", error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: "Error retrieving conversations"
            });
        }
    };

    async createConversation(req, res) {
        try {
            const { firstId, secondId } = req.body;

            // Check valid ID
            if (!mongoose.Types.ObjectId.isValid(firstId) || !mongoose.Types.ObjectId.isValid(secondId)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Id is not valid."
                });
            }

            // Check if the two IDs are the same
            if (firstId === secondId) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    success: false,
                    error: "Cannot create a conversation with yourself."
                });
            }

            //Check if the two users exist
            const user1 = await User.findById(firstId);
            const user2 = await User.findById(secondId);
            if (!user1 || !user2) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    success: false,
                    error: "One or both users not found."
                });
            }

            const conversations = await Conversation.findOne({
                members: { $all: [firstId, secondId] }
            })

            if (conversations)
                return res.status(StatusCodes.OK).json({
                    success: true,
                    data: conversations
                });

            const newConversation = new Conversation({
                members: [firstId, secondId]
            });
            await newConversation.save();

            res.status(StatusCodes.CREATED).json({
                success: true,
                data: newConversation
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
export default new ChatBox;