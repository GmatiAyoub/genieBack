import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article", required: true },
    nom: { type: String, required: true },
    contenu: { type: String, required: true },
    auteur: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
    editToken: { type: String, required: true }, // permet à l'auteur (même anonyme) de modifier son commentaire
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);