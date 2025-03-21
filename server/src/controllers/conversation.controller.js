import { StatusCodes } from "http-status-codes";
import Conversation from "../models/conversation.model.js";


class ChatBox {
    async getUserConversation(req, res) {
        try {
            const userId = req.params.userId;

            const conversation = await Conversation.find({ members: { $in: [userId] } })

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

            const conversation = await Conversation.findOne({
                members: { $all: [firstId, secondId] }
            })

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

