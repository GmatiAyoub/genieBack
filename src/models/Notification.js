import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: { type: String, enum: ["admin", "contributeur"], required: true },
    type: { type: String, required: true }, // ex: "comment"
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);