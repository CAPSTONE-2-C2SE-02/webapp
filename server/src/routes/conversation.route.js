import express from "express";
import Chat from "../controllers/conversation.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";



const router = express.Router();

router.get("/find/:firstId/:secondId", authenticated, Chat.findConversation);
router.get("/:_id", authenticated, Chat.getUserConversation);
router.post("/createChat", authenticated, Chat.createConversation);


export default router;