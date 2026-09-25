import Book from "../models/Book.js";
import { notifyAdmins, notifyContributor } from "../utils/notify.js";

export const listBooks = async (req, res) => {
  try {
    const books = await Book.find({ disponible: true, statut: "Validé" }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listPendingBooks = async (req, res) => {
  try {
    const books = await Book.find({ statut: "En attente" })
      .populate("contributeur", "nom email")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ contributeur: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const { titre, prix, description } = req.body;
    if (!titre || prix === undefined) {
      return res.status(400).json({ message: "titre et prix sont requis" });
    }
    const book = await Book.create({
      titre,
      prix,
      description,
      image: req.file ? req.file.filename : "",
      statut: req.user.role === "admin" ? "Validé" : "En attente",
      contributeur: req.user._id,
    });

    if (req.user.role !== "admin") {
await notifyAdmins("book", `Nouveau livre soumis : "${titre}"`, "/admin/validation-livres");    }

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    const isOwner = book.contributeur?.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    const { titre, prix, description, disponible } = req.body;
    if (titre !== undefined) book.titre = titre;
    if (prix !== undefined) book.prix = prix;
    if (description !== undefined) book.description = description;
    if (disponible !== undefined) book.disponible = disponible;
    if (req.file) book.image = req.file.filename;

    if (req.user.role !== "admin") book.statut = "En attente";

    await book.save();
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const validateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    book.statut = "Validé";
    await book.save();

await notifyContributor(book.contributeur, "book_validated", `Votre livre "${book.titre}" a été validé.`, "/contributeur/mes-livres");
    res.json({ message: "Livre validé", book });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    await book.deleteOne();
    res.json({ message: "Livre supprimé" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};