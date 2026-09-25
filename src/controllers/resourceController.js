import Resource from "../models/Resource.js";
import { notifyAdmins, notifyContributor } from "../utils/notify.js";

export const createResource = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier requis" });

    const { titre, matiere, type } = req.body;
    if (!titre || !matiere || !type) {
      return res.status(400).json({ message: "titre, matiere et type sont requis" });
    }

    const resource = await Resource.create({
      titre,
      matiere,
      type,
      fichier: req.file.filename,
      statut: req.user.role === "admin" ? "Validé" : "En attente",
      contributeur: req.user._id,
    });

    if (req.user.role !== "admin") {
await notifyAdmins("resource", `Nouvelle ressource soumise : "${titre}"`, "/admin/validation-ressources");    }

    res.status(201).json(resource);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listPublicResources = async (req, res) => {
  try {
    const { matiere, type } = req.query;
    const filter = { statut: "Validé" };
    if (matiere) filter.matiere = matiere;
    if (type) filter.type = type;

    const resources = await Resource.find(filter).select("-contributeur").sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ statut: "En attente" })
      .populate("contributeur", "nom email")
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const validateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Ressource introuvable" });

    resource.statut = "Validé";
    await resource.save();

await notifyContributor(resource.contributeur, "resource_validated", `Votre ressource "${resource.titre}" a été validée.`, "/contributeur/mes-ressources");
    res.json({ message: "Ressource validée", resource });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ message: "Ressource introuvable" });

    await resource.deleteOne();
    res.json({ message: "Ressource supprimée" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ contributeur: req.user._id }).sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};