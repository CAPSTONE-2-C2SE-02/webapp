import amqp from "amqplib";
import { VNPay, VnpLocale, dateFormat, ProductCode, ignoreLogger } from "vnpay";
import vnpayConfig from "../config/vnpay.config.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Tour from "../models/tour.model.js";
import { releaseSlots } from "../services/booking.service.js";

async function processPayment() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue("PAYMENT_QUEUE", { durable: true });

    console.log("🔄 [*] Waiting for payment messages in PAYMENT_QUEUE");

    channel.consume("PAYMENT_QUEUE", async (msg) => {
        if (msg !== null) {
            const { bookingId, userId, fullName, phoneNumber, email } = JSON.parse(msg.content.toString());
            console.log(`💳 Processing payment for bookingId: ${bookingId}`);

            try {
                const booking = await Booking.findById(bookingId);
                if (!booking) {
                    console.error(`❌ Booking ${bookingId} not found`);
                    channel.nack(msg, false, false); // Reject message
                    return;
                }

                const transactionId = Date.now().toString() + Math.floor(1000 + Math.random() * 9000).toString();

                const newPayment = await Payment.create({
                    bookingId,
                    userId,
                    fullName,
                    phoneNumber,
                    email,
                    transactionId,
                    typePayment: "VNPAY",
                    amountPaid: booking.depositAmount,
                    status: "PENDING"
                });

                // Tạo URL thanh toán VNPay
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

                console.log(`✅ Payment URL created for bookingId: ${bookingId}`, vnp_Params);
                channel.ack(msg);

            } catch (error) {
                console.error("❌ Error processing payment:", error);
                channel.nack(msg, false, true);
            }
        }
    });
}

// Xử lý callback từ VNPay
async function processVnpayCallback(vnpParams) {
    try {
        console.log("🔄 Processing VNPay callback:", vnpParams);

        const payment = await Payment.findOne({ transactionId: vnpParams["vnp_TxnRef"] });
        if (!payment) {
            console.error("❌ Payment not found for transaction:", vnpParams["vnp_TxnRef"]);
            return;
        }

        const booking = await Booking.findById(payment.bookingId);
        if (!booking || booking.status === "TIMEOUT") {
            console.error("❌ Booking not found or expired:", payment.bookingId);
            return;
        }

        if (vnpParams["vnp_ResponseCode"] === "00") {
            // Thanh toán thành công
            payment.status = "SUCCESS";
            booking.status = "PAID";
            booking.paymentMethod = "VNPAY";
            booking.paymentStatus = "PAID";

            const tour = await Tour.findById(booking.tourId);
            if (tour) {
                tour.totalBookings += 1;
                await tour.save();
            }
        } else {
            // Thanh toán thất bại
            payment.status = "FAILED";

            const tour = await Tour.findById(booking.tourId);
            if (tour) {
                tour.availableSlots += (booking.adults || 0) + (booking.youths || 0) + (booking.children || 0);
                await tour.save();
            }

            releaseSlots(booking.tourId, (booking.adults || 0) + (booking.youths || 0) + (booking.children || 0));
        }

        payment.transactionNo = vnpParams["vnp_TransactionNo"];
        payment.bankCode = vnpParams["vnp_BankCode"];
        payment.paymentTime = new Date();
        await payment.save();
        await booking.save();

        console.log(`✅ Payment processed successfully for bookingId: ${booking._id}`);

    } catch (error) {
        console.error("❌ Error processing VNPay callback:", error);
    }
}

processPayment().catch(console.error);

export { processVnpayCallback };
