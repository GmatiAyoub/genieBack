import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    livre: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    nomClient: { type: String, required: true },
    telephone: { type: String, required: true }, // RM-04 : obligatoire
    adresse: { type: String, required: true },
    statut: {
      type: String,
      enum: ["Nouveau", "Traité"],
      default: "Nouveau",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);