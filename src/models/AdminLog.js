import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    targetId: String,
    details: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);
