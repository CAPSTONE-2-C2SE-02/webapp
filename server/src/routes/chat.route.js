import express from "express";
import chatMessage from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/messages", chatMessage.getMessages);
router.post("/send", chatMessage.sendMessage);
router.post("/conversations", chatMessage.createOrGetConversation)


export default router;
