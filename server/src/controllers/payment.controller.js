import { sendToQueue } from "../services/queue.service.js";
import { processVnpayCallback } from "../workers/payment.worker.js";
import { StatusCodes } from "http-status-codes";
import Payment from "../models/payment.model.js";

class PaymentController {
    async createPayment(req, res) {
        try {
            const { bookingId, typePayment, fullName, country, address, city, note } = req.body;
            const userId = req.user.userId;

            if (!bookingId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Missing booking id" });
            }

            sendToQueue("PAYMENT_QUEUE", { bookingId, typePayment, fullName, country, address, city, note, userId });

            return res.status(StatusCodes.OK).json({ success: true, message: "Payment request queued successfully" });
        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal server error" });
        }
    }

    async vnpReturnURL(req, res) {
        try {
            const vnpParams = { ...req.query };
            await processVnpayCallback(vnpParams, res);
        } catch (error) {
            console.error("Error in vnpReturnURL:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal Server Error" });
        }
    }

    // [GET] /api/v1/payments/booking/:id
    async getPaymentByBookingId(req, res) {
        try {
            const bookingId = req.params.id;
            const payment = await Payment.findOne({ bookingId })
                .populate("userId", "fullName email phoneNumber")
                .populate("bookingId", "tourId travelerId adults youths children paymentStatus status");
            if (!payment) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Payment not found" });
            }
            return res.status(StatusCodes.OK).json({ success: true, result: payment });
        } catch (error) {
            console.error("Error in vnpIpnURL:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal Server Error" });
        }
    }
}

export default new PaymentController();
