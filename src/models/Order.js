import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    livre: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    nomClient: { type: String, required: true },
    telephone: { type: String, required: true },
    adresse: { type: String, required: true },
    statut: {
      type: String,
      enum: ["Nouveau", "Traité"],
      default: "Nouveau",
    },
    paiement: {
      type: String,
      enum: ["Non payé", "Payé"],
      default: "Non payé",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);