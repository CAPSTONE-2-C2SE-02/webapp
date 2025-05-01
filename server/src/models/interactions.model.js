import mongoose, { Schema } from "mongoose";

const interactionsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tourId: {
      type: Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    interaction_type: {
      type: String,
      enum: ["VIEW", "BOOK", "FAVORITE"],
      required: true,
    }
  }, { timestamps: true }
);

const Interactions = mongoose.model('Interactions', interactionsSchema); 
export default Interactions;