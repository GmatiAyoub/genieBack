import Article from "../models/Article.js";
import Comment from "../models/Comment.js";
import { notifyAdmins, notifyContributor } from "../utils/notify.js";

const TITRE_MAX = 200;
const CONTENU_MAX = 20000;

const titreError = (v) => {
  if (typeof v !== "string" || !v.trim()) return "Le titre est requis";
  if (v.trim().length > TITRE_MAX) return `Titre trop long (${TITRE_MAX} caractères maximum)`;
  return null;
};

const contenuError = (v) => {
  if (typeof v !== "string" || !v.trim()) return "Le contenu est requis";
  if (v.length > CONTENU_MAX) return `Contenu trop long (${CONTENU_MAX} caractères maximum)`;
  return null;
};

const toBool = (v) => v === true || v === "true";

// GET /api/articles (public) — articles validés uniquement
export const listArticles = async (req, res) => {
  try {
    const articles = await Article.find({ publie: true, statut: "Validé" })
      .select("-contributeur")
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/articles/pending (Admin only)
export const listPendingArticles = async (req, res) => {
  try {
    const articles = await Article.find({ statut: "En attente" })
      .populate("contributeur", "nom email")
      .sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/articles/mine (Contributeur ou Admin connecté)
export const listMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ contributeur: req.user._id }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/articles/:id (public) — un article en attente n'est jamais visible
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).select("-contributeur");
    if (!article || !article.publie || article.statut !== "Validé") {
      return res.status(404).json({ message: "Article introuvable" });
    }
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/articles (Contributeur ou Admin)
export const createArticle = async (req, res) => {
  try {
    const { titre, contenu, rtl } = req.body || {};
    const error = titreError(titre) || contenuError(contenu);
    if (error) return res.status(400).json({ message: error });

    const article = await Article.create({
      titre: titre.trim(),
      contenu,
      rtl: toBool(rtl),
      statut: req.user.role === "admin" ? "Validé" : "En attente",
      contributeur: req.user._id,
    });

    if (req.user.role !== "admin") {
      await notifyAdmins("article", `Nouveau blog soumis : "${article.titre}"`, "/admin/validation-blog");
    }

    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/articles/:id (Admin, ou Contributeur propriétaire)
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    const isOwner = article.contributeur?.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const { titre, contenu, rtl } = req.body || {};

    if (titre !== undefined) {
      const error = titreError(titre);
      if (error) return res.status(400).json({ message: error });
    }
    if (contenu !== undefined) {
      const error = contenuError(contenu);
      if (error) return res.status(400).json({ message: error });
    }

    // Seuls ces trois champs sont modifiables, le reste du corps est ignoré
    if (titre !== undefined) article.titre = titre.trim();
    if (contenu !== undefined) article.contenu = contenu;
    if (rtl !== undefined) article.rtl = toBool(rtl);

    // Un contributeur qui modifie son article doit le faire revalider
    if (req.user.role !== "admin") article.statut = "En attente";

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/articles/:id/validate (Admin only)
export const validateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    article.statut = "Validé";
    await article.save();

    await notifyContributor(
      article.contributeur,
      "article_validated",
      `Votre blog "${article.titre}" a été validé.`,
      "/contributeur/mes-articles"
    );

    res.json({ message: "Article validé", article });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/articles/:id (Admin only) — supprime aussi ses commentaires
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    await Comment.deleteMany({ article: article._id });
    await article.deleteOne();

    res.json({ message: "Article supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};