import mongoose from "mongoose";

//Anh Tuan
const invalidatedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
    }
});

const InvalidatedToken = mongoose.model("InvalidatedToken", invalidatedTokenSchema);
export default InvalidatedToken;