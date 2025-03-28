import { StatusCodes } from "http-status-codes";
import { ProductCode, VNPay, VnpLocale, dateFormat, ignoreLogger } from "vnpay";
import vnpayConfig from "../config/vnpay.config.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Tour from "../models/tour.model.js";
import querystring from 'querystring';
import crypto from 'crypto';

class PaymentController {
    async createPayment(req, res) {
        try {
            const { bookingId, typePayment, fullName, phoneNumber, email, bankCode } = req.body;
            const userId = req.user.userId;

            if (!bookingId) {
                return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Missing booking id" });
            }

            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Booking information not found" });
            }

            const transactionId = Date.now().toString() + Math.floor(1000 + Math.random() * 9000).toString();

            const newPayment = await Payment.create({
                bookingId,
                userId,
                fullName,
                phoneNumber,
                email,
                transactionId,
                bankCode,
                typePayment: "VNPAY",
                amountPaid: booking.depositAmount,
                status: "PENDING"
            });

            if (typePayment === "VNPAY") {
                const vnpay = new VNPay({
                    tmnCode: vnpayConfig.vnp_TmnCode,
                    secureSecret: vnpayConfig.vnp_HashSecret,
                    vnpayHost: "https://sandbox.vnpayment.vn",
                    testMode: true,
                    hashAlgorithm: "SHA512",
                    enableLog: true,
                    loggerFn: ignoreLogger
                });

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);

                const vnp_Params = await vnpay.buildPaymentUrl({
                    vnp_Version: "2.1.0",
                    vnp_Amount: booking.depositAmount,
                    vnp_IpAddr: req.ip,
                    vnp_TxnRef: transactionId,
                    vnp_OrderInfo: `Payment for booking ${bookingId}`,
                    vnp_OrderType: ProductCode.Other,
                    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
                    vnp_Locale: VnpLocale.VN,
                    vnp_CreateDate: dateFormat(new Date()),
                    vnp_ExpireDate: dateFormat(tomorrow),
                    vnp_Command: "pay",
                    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
                    vnp_CurrCode: "VND",
                });

                return res.json({ success: true, vnp_Params });
            }
        } catch (error) {
            console.error(error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message || "Internal server error" });
        }
    }

    async vnpReturnURL(req, res) {
        try {
            const vnpParams = { ...req.query };
            console.log(
                "vnp_TxnRef: ", vnpParams["vnp_TxnRef"],
                "vnp_ResponseCode: ", vnpParams["vnp_ResponseCode"],
                "vnp_TransactionNo: ", vnpParams["vnp_TransactionNo"],
                "vnp_BankCode: ", vnpParams["vnp_BankCode"]
            );

            const payment = await Payment.findOne({ transactionId: vnpParams["vnp_TxnRef"] });
            if (!payment) {
                return res.status(404).json({ success: false, error: "Payment not found" });
            }

            if (vnpParams["vnp_ResponseCode"] === "00") {
                payment.status = "SUCCESS";

                const booking = await Booking.findById(payment.bookingId);
                if (booking) {
                    const tour = await Tour.findById(booking.tourId);
                    if (tour) {
                        tour.availableSlots = tour.availableSlots - ((booking.adults | 0) + (booking.youths | 0) + (booking.children | 0));
                        tour.totalBookings += 1;
                        await tour.save();
                    }
                    booking.status = "PAID";
                    booking.paymentMethod = "VNPAY";
                    booking.paymentStatus = "PAID";
                    await booking.save();
                }
            } else {
                payment.status = "FAILED";
            }

            payment.transactionId = vnpParams["vnp_TransactionNo"];
            payment.bankCode = vnpParams["vnp_BankCode"];
            payment.paymentTime = new Date();
            await payment.save();

            return res.status(200).json({ success: true, message: "Payment updated successfully", payment });
        } catch (error) {
            console.error("Error in vnpReturnURL:", error);
            return res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
}

export default new PaymentController();
