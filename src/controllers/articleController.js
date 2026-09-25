import Article from "../models/Article.js";
import { notifyAdmins, notifyContributor } from "../utils/notify.js";

export const listArticles = async (req, res) => {
  try {
    const articles = await Article.find({ publie: true, statut: "Validé" }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

export const listMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ contributeur: req.user._id }).sort({ createdAt: -1 });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article || !article.publie) return res.status(404).json({ message: "Article introuvable" });
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createArticle = async (req, res) => {
  try {
    const { titre, contenu, rtl } = req.body;
    if (!titre || !contenu) {
      return res.status(400).json({ message: "titre et contenu sont requis" });
    }
    const article = await Article.create({
      titre,
      contenu,
      rtl: !!rtl,
      statut: req.user.role === "admin" ? "Validé" : "En attente",
      contributeur: req.user._id,
    });

    if (req.user.role !== "admin") {
await notifyAdmins("article", `Nouveau blog soumis : "${titre}"`, "/admin/validation-blog");    }

    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    const isOwner = article.contributeur?.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    Object.assign(article, req.body);
    if (req.user.role !== "admin") article.statut = "En attente";

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const validateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    article.statut = "Validé";
    await article.save();

await notifyContributor(article.contributeur, "article_validated", `Votre blog "${article.titre}" a été validé.`, "/contributeur/mes-articles");
    res.json({ message: "Article validé", article });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    await article.deleteOne();
    res.json({ message: "Article supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};