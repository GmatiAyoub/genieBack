import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());        // <-- DOIT être avant toutes les routes qui lisent req.body

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API Le Génie Bac Sciences opérationnelle" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/articles", articleRoutes);

// Middleware global de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Erreur serveur interne" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});