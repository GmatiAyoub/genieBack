import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
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

// POST /api/users  (Admin only) — RM-02 : seul l'Admin crée un compte
export const createContributor = async (req, res) => {
  const { nom, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "Email déjà utilisé" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    nom,
    email,
    password: hashed,
    role: "contributeur",
  });

  res.status(201).json({ _id: user._id, nom: user.nom, email: user.email, role: user.role });
};

// GET /api/users (Admin only)
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