import express from "express";
import Message from "../controllers/message.controller.js"


const router = express.Router();


router.post("/", Message.createMessage);
router.get("/:chatId", Message.getMessages);


export default router;