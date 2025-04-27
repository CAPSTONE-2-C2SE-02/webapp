import express from "express";
import ChatMessage from "../controllers/message.controller.js"
import { authenticated } from "../middlewares/authorize.middleware.js";
// import upload from '../middlewares/multer.middleware.js';

const router = express.Router();

// router.post("/", authenticated, upload.array("images"), Message.createMessage);
router.post("/", authenticated, ChatMessage.sendMessage);

router.get("/:id", authenticated, ChatMessage.getMessages);

router.get("/conversations/sidebar", authenticated, ChatMessage.getConversations);

export default router;