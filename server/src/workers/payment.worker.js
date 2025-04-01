import amqp from "amqplib";
import { StatusCodes } from "http-status-codes";
import { ProductCode, VNPay, VnpLocale, dateFormat, ignoreLogger } from "vnpay";
import vnpayConfig from "../config/vnpay.config.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Tour from "../models/tour.model.js";
import { releaseSlots } from "../services/booking.service.js";

async function processPayment() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("PAYMENT_QUEUE", { durable: true });

    channel.consume("PAYMENT_QUEUE", async (msg) => {
        if (msg !== null) {
            const { bookingId, fullName, country, address, city, note, userId } = JSON.parse(msg.content.toString());
            console.log(`💳 Processing payment for bookingId: ${bookingId}`);

            try {
                const booking = await Booking.findById(bookingId);
                if (!booking) {
                    console.error(`❌ Booking ${bookingId} not found`);
                    channel.nack(msg, false, false); // Reject message
                    return;
                }

                const transactionId = Date.now().toString() + Math.floor(1000 + Math.random() * 9000).toString();

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
                    vnp_IpAddr: "127.0.0.1",
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

                const newPayment = await Payment.create({
                    bookingId,
                    userId,
                    fullName,
                    country,
                    address,
                    city,
                    note,
                    transactionId,
                    typePayment: "VNPAY",
                    amountPaid: booking.depositAmount,
                    status: "PENDING",
                    paymentUrl: vnp_Params
                });

                console.log(`✅ Payment URL created for bookingId: ${bookingId}`, vnp_Params);
                channel.ack(msg);

            } catch (error) {
                console.error("❌ Error processing payment:", error);
                channel.nack(msg, false, true);
            }
        }
    });
}

async function processVnpayCallback(vnpParams, res) {
    try {
        console.log("🔄 Processing VNPay callback:", vnpParams);

        const payment = await Payment.findOne({ transactionId: vnpParams["vnp_TxnRef"] });
        if (!payment) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Payment not found" });
        }

        const booking = await Booking.findById(payment.bookingId);
        if (!booking || booking.status === "TIMEOUT") {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, error: "Booking not found or expired" });
        }

        if (vnpParams["vnp_ResponseCode"] === "00") {
            payment.status = "SUCCESS";
            payment.transactionNo = vnpParams["vnp_TransactionNo"]
            booking.status = "PAID";
            booking.paymentMethod = "VNPAY";
            booking.paymentStatus = "PAID";

            const tour = await Tour.findById(booking.tourId);
            if (tour) {
                tour.totalBookings += 1;
                await tour.save();
            }

            await payment.save();
            await booking.save();

            console.log(`✅ Payment processed successfully for bookingId: ${booking._id}`);

            return res.status(StatusCodes.OK).json({
                success: true,
                message: "Payment successful",
                result: {
                    paymentId: payment._id,
                    bookingId: booking._id,
                    amount: payment.amountPaid,
                    transactionNo: vnpParams["vnp_TransactionNo"],
                    bankCode: vnpParams["vnp_BankCode"]
                }
            });

        } else {
            payment.status = "FAILED";
            booking.paymentStatus = "FAILED";
            booking.status = "FAILED";
            const tour = await Tour.findById(booking.tourId);
            if (tour) {
                tour.availableSlots += (booking.adults || 0) + (booking.youths || 0) + (booking.children || 0);
                await tour.save();
            }

            releaseSlots(booking.tourId, (booking.adults || 0) + (booking.youths || 0) + (booking.children || 0));

            await payment.save();
            await booking.save();

            console.log(`❌ Payment failed for bookingId: ${booking._id}`);

            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                error: "Payment failed",
                transactionNo: vnpParams["vnp_TransactionNo"]
            });
        }

    } catch (error) {
        console.error("❌ Error processing VNPay callback:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: "Internal Server Error" });
    }
}

processPayment().catch(console.error);

export { processVnpayCallback };

