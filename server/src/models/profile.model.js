import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    fullName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    address: {
        type: String,
        default: ''
    },
    profilePicture: {
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
    }
},
    { timestamps: true }
);

profileSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;