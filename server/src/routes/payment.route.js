import express from "express";
import paymentController from "../controllers/payment.controller.js";
import { authenticated } from "../middlewares/authorize.middleware.js";


const router = express.Router();

router.post("/", authenticated, paymentController.createPayment);
router.get("/vnp-return", paymentController.vnpReturnURL);

export default router;
