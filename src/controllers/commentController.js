import crypto from "crypto";
import Comment from "../models/Comment.js";
import Article from "../models/Article.js";
import { notifyAdmins } from "../utils/notify.js";

export const listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ article: req.params.id })
      .select("-editToken")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    const { contenu, parentComment } = req.body;
    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide" });
    }

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent || parent.article.toString() !== req.params.id) {
        return res.status(400).json({ message: "Commentaire parent invalide" });
      }
    }

    const editToken = crypto.randomBytes(16).toString("hex");

    const comment = await Comment.create({
      article: req.params.id,
      nom: "Anonyme",
      contenu,
      auteur: req.user ? req.user._id : null,
      parentComment: parentComment || null,
      editToken,
    });

await notifyAdmins("comment", `Nouveau ${parentComment ? "réponse" : "commentaire"} sur "${article.titre}"`, `/blog#article-${article._id}`);
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Commentaire introuvable" });

    const { contenu, editToken } = req.body;
    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ message: "Le commentaire ne peut pas être vide" });
    }

    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && (!editToken || editToken !== comment.editToken)) {
      return res.status(403).json({ message: "Non autorisé à modifier ce commentaire" });
    }

    comment.contenu = contenu;
    await comment.save();

    const { editToken: _omit, ...safeComment } = comment.toObject();
    res.json(safeComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Commentaire introuvable" });

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: "Commentaire supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};