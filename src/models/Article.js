import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    contenu: { type: String, required: true },
    rtl: { type: Boolean, default: false },
    publie: { type: Boolean, default: true },
    statut: {
      type: String,
      enum: ["En attente", "Validé"],
      default: "En attente",
    },
    contributeur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Article", articleSchema);