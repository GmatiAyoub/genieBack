import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: { type: String, enum: ["admin", "contributeur"], required: true },
    recipientUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: null }, // page vers laquelle rediriger au clic
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// Suppression automatique des notifications de plus de 90 jours
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });
export default mongoose.model("Notification", notificationSchema);