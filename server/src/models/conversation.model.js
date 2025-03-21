import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    members: Array,
}, { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
