import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const paymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    transactionId: {
        type: String
    },
    transactionNo: {
        type: String
    },
    bankCode: {
        type: String
    },
    typePayment: {
        type: String,
        enum: ['VNPAY', "MOMO"],
    },
    paymentTime: {
        type: Date
    },
    status: {
        type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUND'],
        default: 'PENDING'
    },
    amountPaid: {
        type: Number
    },
    paymentUrl: {
        type: Object
    }
},
    {
        timestamps: true
    }
);

paymentSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true })
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
