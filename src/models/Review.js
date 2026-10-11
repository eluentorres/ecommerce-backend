import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

reviewSchema.index(
  { productId: 1, userId: 1 },
  { unique: true }
);

export default mongoose.model("Review", reviewSchema);
