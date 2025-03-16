import express from "express";

import authRouter from "./auth.route.js";
import userRoutes from './user.route.js';
import profileRoutes from './profile.route.js';
import uploadRouter from "./upload.route.js";

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRoutes);
router.use('/profiles', profileRoutes);
router.use('/uploads', uploadRouter);

export default router;