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
    fullName: {
        type: String,
    },
    country: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    email: {
        type: String,
    },
    address: {
        type: String,
    },
    city: {
        type: String,
    },
    note: {
        type: String,
    },
    transactionId: {
        type: String
    },
    bankCode: {
        type: String
    },
    typePayment: {
        type: String,
        enum: ['VNPAY'],
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
    }
},
    {
        timestamps: true
    }
);

paymentSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true })
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
