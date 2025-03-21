import mongoose from "mongoose";
import mongooseDelete from "mongoose-delete";

const commentSchema = new mongoose.Schema(
    {
        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },
        profileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        },
        content: {
            type: String,
        },
        parentComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
            default: null
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Profile"
            }
        ],
    },
    { timestamps: true }
);

commentSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });

export default mongoose.model("Comment", commentSchema);
