import express from "express";

import authRouter from "./auth.route.js";
import userRoutes from './user.route.js';
import profileRoutes from './profile.route.js';
import uploadRouter from "./upload.route.js";
import postRouter from "./post.route.js";
import tourRouter from "./tour.route.js";
import commentRouter from "./comment.route.js";
import calendarRouter from "./calendar.route.js";
import bookingRouter from "./booking.route.js";


const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/uploads', uploadRouter);
router.use('/posts', postRouter);
router.use('/comments', commentRouter);
router.use('/tours', tourRouter);
router.use('/calendars', calendarRouter);
router.use('/bookings', bookingRouter);

export default router;