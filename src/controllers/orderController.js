import Order from "../models/Order.js";
import Book from "../models/Book.js";

// POST /api/orders (public) — BF-04
export const createOrder = async (req, res) => {
  try {
    const { livre, nomClient, telephone, adresse } = req.body;

    if (!livre || !nomClient || !telephone || !adresse) {
      return res.status(400).json({ message: "Tous les champs sont requis (livre, nomClient, telephone, adresse)" });
    }

    const book = await Book.findById(livre);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    const order = await Order.create({ livre, nomClient, telephone, adresse });

    res.status(201).json({
      message: "Votre commande a été envoyée, nous vous contacterons bientôt",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/orders (Admin only) — BF-12
export const listOrders = async (req, res) => {
  try {
    const { statut } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;

    const orders = await Order.find(filter).populate("livre", "titre prix").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/orders/:id/process (Admin only) — BF-12
export const processOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    order.statut = "Traité";
    await order.save();
    res.json({ message: "Commande marquée comme traitée", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};