import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    titre: { type: String, required: true },
    matiere: { type: String, required: true },
    type: {
      type: String,
      enum: ["Cours", "Série", "Devoir"],
      required: true,
    },
    fichier: { type: String, required: true }, // chemin/nom du fichier stocké
    statut: {
      type: String,
      enum: ["En attente", "Validé"],
      default: "En attente",
    },
    contributeur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Resource", resourceSchema);