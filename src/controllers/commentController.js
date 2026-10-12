import crypto from "crypto";
import Comment from "../models/Comment.js";
import Article from "../models/Article.js";
import { notifyAdmins } from "../utils/notify.js";

const COMMENT_MAX = 1000;
const isObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

const commentError = (contenu) => {
  if (typeof contenu !== "string" || !contenu.trim()) return "Le commentaire ne peut pas être vide";
  if (contenu.trim().length > COMMENT_MAX) return `Commentaire trop long (${COMMENT_MAX} caractères maximum)`;
  return null;
};

// GET /api/articles/:id/comments (public) — ni le jeton de modification ni l'auteur ne sont exposés
export const listComments = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "ID invalide" });

    const comments = await Comment.find({ article: req.params.id })
      .select("-editToken -auteur")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/articles/:id/comments (public, authentification optionnelle)
export const createComment = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "ID invalide" });

    const article = await Article.findById(req.params.id);
    if (!article || !article.publie || article.statut !== "Validé") {
      return res.status(404).json({ message: "Article introuvable" });
    }

    const { contenu, parentComment } = req.body || {};
    const error = commentError(contenu);
    if (error) return res.status(400).json({ message: error });

    let parentId = null;
    if (parentComment !== undefined && parentComment !== null && parentComment !== "") {
      if (!isObjectId(parentComment)) {
        return res.status(400).json({ message: "Commentaire parent invalide" });
      }
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.article.toString() !== req.params.id) {
        return res.status(400).json({ message: "Commentaire parent invalide" });
      }
      // Une réponse à une réponse est rattachée au commentaire principal (un seul niveau d'imbrication)
      parentId = parent.parentComment || parent._id;
    }

    const editToken = crypto.randomBytes(16).toString("hex");

    const comment = await Comment.create({
      article: article._id,
      nom: "Anonyme",
      contenu: contenu.trim(),
      auteur: req.user ? req.user._id : null, // gardé en interne, jamais renvoyé
      parentComment: parentId,
      editToken,
    });

    // L'admin n'est pas notifié de ses propres commentaires
    if (req.user?.role !== "admin") {
      await notifyAdmins(
        "comment",
        `${parentId ? "Nouvelle réponse" : "Nouveau commentaire"} sur "${article.titre}"`,
        `/blog#article-${article._id}`
      );
    }

    const { auteur, ...publicComment } = comment.toObject();
    res.status(201).json(publicComment); // contient editToken : renvoyé uniquement à son auteur
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/comments/:id — modification par l'auteur (via editToken) ou par l'Admin
export const updateComment = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "ID invalide" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Commentaire introuvable" });

    const { contenu, editToken } = req.body || {};

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && (typeof editToken !== "string" || editToken !== comment.editToken)) {
      return res.status(403).json({ message: "Non autorisé à modifier ce commentaire" });
    }

    const error = commentError(contenu);
    if (error) return res.status(400).json({ message: error });

    comment.contenu = contenu.trim();
    await comment.save();

    const { editToken: _t, auteur: _a, ...safeComment } = comment.toObject();
    res.json(safeComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/comments/:id (Admin only) — supprime aussi les réponses
export const deleteComment = async (req, res) => {
  try {
    if (!isObjectId(req.params.id)) return res.status(400).json({ message: "ID invalide" });

    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Commentaire introuvable" });

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};