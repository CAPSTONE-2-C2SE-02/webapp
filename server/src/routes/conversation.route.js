import express from "express";
import Chat from "../controllers/conversation.controller.js"


const router = express.Router();

router.get("/find/:firstId/:secondId", Chat.findConversation);
router.get("/:userId", Chat.getUserConversation);
router.post("/createChat", Chat.createConversation);


export default router;