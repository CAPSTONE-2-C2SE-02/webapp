import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";
import Visibility from "../enums/visibility.enum.js";

const postSchema = new mongoose.Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    hashtag: {
        type: [String],
        default: [],
    },
    content: {
        type: [String],
    },
    location: {
        type: String
    },
    imageUrls: {
        type: [String],
        default: []
    },
    likes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User"
    },
    activeComment: {
        type: Boolean,
        default: true,
    },
    tourAttachment: {
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

