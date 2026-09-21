import Article from "../models/Article.js";

// GET /api/articles (public)
export const listArticles = async (req, res) => {
  try {
    const articles = await Article.find({ publie: true, statut: "Validé" }).sort({ createdAt: -1 });
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

// GET /api/articles/:id (public)
export const getArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article || !article.publie) return res.status(404).json({ message: "Article introuvable" });
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/articles (Contributeur ou Admin)
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
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/articles/:id
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

// PATCH /api/articles/:id/validate (Admin only)
export const validateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article introuvable" });

    article.statut = "Validé";
    await article.save();
    res.json({ message: "Article validé", article });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/articles/:id (Admin only)
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