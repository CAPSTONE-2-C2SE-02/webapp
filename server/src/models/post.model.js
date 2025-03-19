import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import Visibility from "../enums/visibility.enum.js";

const postSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile',
    },
    hashtag: {
        type: [String],
        default: [],
    },
    taggedUser: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Profile',
        default: []
    },
    content: {
        type: String,
    },
    location: {
        type: String
    },
    mediaUrls: {
        type: [String],
        default: []
    },
    visibility: {
        type: String,
        enum: Object.values(Visibility),
        default: Visibility.PUBLIC
    },
    likedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Profile"
    },
    activeComment: {
        type: Boolean,
        default: true,
    },
    tourId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
        default: null
    },
    sharedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    caption: {
        type: String,
        default: "",
    },
},
    { timestamps: true }
);

postSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

const Post = mongoose.model("Post", postSchema);

export default Post;

