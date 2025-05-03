import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      enum: ["post", "tour"],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: function () {
        return this.itemType === "post" ? "Post" : "Tour";
      },
      required: true,
    },
  },
  { timestamps: true }
);

// create a compound index to prevent duplicate saves
bookmarkSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true });

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
export default Bookmark;