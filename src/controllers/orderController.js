import Order from "../models/Order.js";
import Book from "../models/Book.js";
import { isValidTunisianPhone } from "../utils/validators.js";
import { notifyAdmins } from "../utils/notify.js";

export const createOrder = async (req, res) => {
  try {
    const { livre, nomClient, telephone, adresse } = req.body;

    if (!livre || !nomClient || !telephone || !adresse) {
      return res.status(400).json({ message: "Tous les champs sont requis (livre, nomClient, telephone, adresse)" });
    }

    if (!isValidTunisianPhone(telephone)) {
      return res.status(400).json({
        message: "Le numéro de téléphone doit être un numéro tunisien valide (8 chiffres commençant par 2, 4, 5, 7 ou 9)",
      });
    }

    const book = await Book.findById(livre);
    if (!book) return res.status(404).json({ message: "Livre introuvable" });

    const order = await Order.create({ livre, nomClient, telephone, adresse });

    await notifyAdmins("order", `Nouvelle commande : "${book.titre}" par ${nomClient}`, "/admin/commandes");

    res.status(201).json({
      message: "Votre commande a été envoyée, nous vous contacterons bientôt",
      order,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listOrders = async (req, res) => {
  try {
    const { statut, paiement } = req.query;
    const filter = {};
    if (statut) filter.statut = statut;
    if (paiement) filter.paiement = paiement;

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

// PATCH /api/orders/:id/payment (Admin only) — bascule Payé / Non payé, uniquement si Traité
export const togglePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Commande introuvable" });

    if (order.statut !== "Traité") {
      return res.status(400).json({ message: "Seule une commande traitée peut être marquée payée/non payée" });
    }

    order.paiement = order.paiement === "Payé" ? "Non payé" : "Payé";
    await order.save();
    res.json({ message: `Commande marquée comme ${order.paiement}`, order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};