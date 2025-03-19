import express from "express";
import chatMessage from "../controllers/chat.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";


const router = express.Router();

router.get("/messages", authenticated, chatMessage.getMessages);
router.post("/send", authenticated, chatMessage.sendMessage);
router.post("/conversations", authenticated, chatMessage.createOrGetConversation)


export default router;
