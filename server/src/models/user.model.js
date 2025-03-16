import mongoose from 'mongoose';
import mongooseDelete from "mongoose-delete";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        default: null,
    },
},
    { timestamps: true }
);

userSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

const User = mongoose.model('User', userSchema);
export default User;