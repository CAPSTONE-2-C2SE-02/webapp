import amqp from "amqplib";
import { StatusCodes } from "http-status-codes";
import { ProductCode, VNPay, VnpLocale, dateFormat, ignoreLogger } from "vnpay";
import vnpayConfig from "../config/vnpay.config.js";
import notificationController from "../controllers/notification.controller.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Tour from "../models/tour.model.js";
import User from "../models/user.model.js";
import { releaseBookedDates } from "../services/calendar.service.js";
import { sendEmail } from "../services/email.service.js";

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB"); // dd/MM/yyyy
};

const QUEUE_NAME = "PAYMENT_QUEUE";

async function processPayment() {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
            const { bookingId, userId } = JSON.parse(msg.content.toString());
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
                    vnp_Amount: booking.totalAmount,
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
                    transactionId,
                    typePayment: "VNPAY",
                    amountPaid: booking.totalAmount,
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

            const traveler = await User.findById(booking.travelerId);
            if (!traveler) {
                return res.status(StatusCodes.NOT_FOUND).json({ success: false, error: "Traveler not found" });
            }

            const tourGuide = await User.findById({ _id: tour.author });

            // Send notification for tour guide
            await notificationController.sendNotification({
                body: {
                    type: "BOOKING",
                    senderId: traveler._id,
                    receiverId: tour.author,
                    relatedId: tour._id,
                    relatedModel: "Tour",
                    message: `User ${traveler.username} has just booked your tour "${tour.title}"`,
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });


            // Send notification for traveler
            await notificationController.sendNotification({
                body: {
                    type: "BOOKING",
                    senderId: null,
                    receiverId: traveler._id,
                    relatedId: tour._id,
                    relatedModel: "Tour",
                    message: `You have successfully booked "${tour.title}" by ${tourGuide.fullName}`,
                },
            }, {
                status: () => ({
                    json: () => { },
                }),
            });

            const subject = "Tour Booking Confirmation!";
            const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4CAF50; color: #fff; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Tour Booking Confirmation!</h1>
        </div>
        <div style="padding: 20px;">
            <h2 style="font-size: 20px; color: #4CAF50;">Hello ${traveler.fullName},</h2>
            <p style="font-size: 16px;">Thank you for booking your tour with us. Here are your booking details:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Tour:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${tour.title}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Start Date:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(booking.startDate)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">End Date:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${formatDate(booking.endDate)}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Number of People:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${booking.adults + booking.youths + booking.children}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Total Amount:</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${booking.totalAmount.toLocaleString("en-US")} VND</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Cancellation Code:</td>
                    <td style="padding: 10px; border: 1px solid #ddd; color: #d0011b; font-weight: bold;">${booking.secretKey}</td>
                </tr>
            </table>
            <p style="margin-top: 20px; font-size: 16px; color: #d0011b;">Note: Do not share this cancellation code with anyone!</p>
            <p style="margin-top: 20px; font-size: 16px;">If you have any questions, please contact us via email or our support hotline.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 14px; color: #555;">
            <p style="margin: 0;">Thank you for trusting our service!</p>
            <p style="margin: 0;">&copy; 2025 Tripconnect Travel Company</p>
        </div>
    </div>
`;

            await sendEmail(traveler.email, subject, html);

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
            booking.status = "CANCELED";

            await releaseBookedDates(booking.tourGuideId, booking.startDate, booking.endDate);

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

