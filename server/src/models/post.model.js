import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

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

postSchema.virtual("bookmarks", {
    ref: 'Bookmark',
    localField: '_id',
    foreignField: 'itemId',
    match: { itemType: 'post' }
});

postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

const Post = mongoose.model("Post", postSchema);

export default Post;

