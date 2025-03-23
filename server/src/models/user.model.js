import mongoose from 'mongoose';
import mongooseDelete from "mongoose-delete";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    roleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
    },
    fullName: {
        type: String,
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    address: {
        type: String,
        default: ''
    },
    profilePicture: {
        type: String,
        default: ''
    },
    coverPhoto: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    active: {
        type: Boolean,
        default: true,
    },
    googleId: {
        type: String,
        default: '',
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    followings: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    },
    ranking: {
        type: Number,
        default: null
    },
    rating: {
        type: Number,
        default: null
    },
},
    { timestamps: true }
);

userSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

const User = mongoose.model('User', userSchema);
export default User;