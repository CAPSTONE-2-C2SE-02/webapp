import express from "express";
import Message from "../controllers/message.controller.js"
import { authenticated } from "../middlewares/authorize.middleware.js";
import upload from '../middlewares/multer.middleware.js';




const router = express.Router();


router.post("/", authenticated, upload.array("files"), Message.createMessage);
router.get("/:chatId", authenticated, Message.getMessages);


export default router;