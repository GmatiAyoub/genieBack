import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    prix: { type: Number, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    disponible: { type: Boolean, default: true },
    statut: {
      type: String,
      enum: ["En attente", "Validé"],
      default: "En attente",
    },
    contributeur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);