import express from "express";

import authRouter from "./auth.route.js";
import userRoutes from './user.route.js';
import uploadRouter from "./upload.route.js";
import postRouter from "./post.route.js";
import tourRouter from "./tour.route.js";
import commentRouter from "./comment.route.js";
import calendarRouter from "./calendar.route.js";
import bookingRouter from "./booking.route.js";
import chatRouter from "./conversation.route.js";
import messageRouter from "./message.route.js";


const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRoutes);
router.use('/uploads', uploadRouter);
router.use('/posts', postRouter);
router.use('/comments', commentRouter);
router.use('/tours', tourRouter);
router.use('/calendars', calendarRouter);
router.use('/bookings', bookingRouter);
router.use('/chats', chatRouter);
router.use('/messages', messageRouter);

export default router;