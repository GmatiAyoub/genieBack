import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isValidEmail, passwordError } from "../utils/validators.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body || {};

  // typeof : refuse aussi les objets du type {"$ne": ""} (injection d'opérateurs MongoDB)
  if (!isNonEmptyString(email) || typeof password !== "string" || password.length === 0) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) return res.status(401).json({ message: "Identifiants incorrects" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Identifiants incorrects" });

  res.json({
    _id: user._id,
    nom: user.nom,
    email: user.email,
    role: user.role,
    token: generateToken(user._id),
  });
};

// PATCH /api/auth/password (Admin ou Contributeur connecté)
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};

  if (typeof currentPassword !== "string" || currentPassword.length === 0) {
    return res.status(400).json({ message: "Mot de passe actuel requis" });
  }

  const pwdError = passwordError(newPassword, req.user.role);
  if (pwdError) return res.status(400).json({ message: pwdError });

  if (newPassword === currentPassword) {
    return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'ancien" });
  }

  const user = await User.findById(req.user._id); // req.user n'inclut pas le hash
  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) {
    // 400 et non 401 : un 401 laisserait croire à une session expirée
    return res.status(400).json({ message: "Mot de passe actuel incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Mot de passe modifié avec succès" });
};

// POST /api/auth/users (Admin only) — RM-02 : seul l'Admin crée un compte
export const createContributor = async (req, res) => {
  const { nom, email, password } = req.body || {};

  if (!isNonEmptyString(nom) || !isNonEmptyString(email) || typeof password !== "string") {
    return res.status(400).json({ message: "Nom, email et mot de passe sont requis" });
  }

  const emailNorm = email.trim().toLowerCase();
  if (!isValidEmail(emailNorm)) {
    return res.status(400).json({ message: "Adresse email invalide" });
  }

  const pwdError = passwordError(password, "contributeur");
  if (pwdError) return res.status(400).json({ message: pwdError });

  const exists = await User.findOne({ email: emailNorm });
  if (exists) return res.status(400).json({ message: "Email déjà utilisé" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    nom: nom.trim(),
    email: emailNorm,
    password: hashed,
    role: "contributeur",
  });

  res.status(201).json({ _id: user._id, nom: user.nom, email: user.email, role: user.role });
};

// GET /api/auth/users (Admin only)
export const listContributors = async (req, res) => {
  const users = await User.find({ role: "contributeur" }).select("-password");
  res.json(users);
};

// DELETE /api/auth/users/:id (Admin only)
export const deleteContributor = async (req, res) => {
  if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "ID invalide" });
  }

  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
  if (user.role === "admin") return res.status(403).json({ message: "Impossible de supprimer un Admin" });

  await user.deleteOne();
  res.json({ message: "Contributeur supprimé" });
};