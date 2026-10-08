import "express-async-errors"; // doit rester le tout premier import
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import articleRoutes from "./routes/articleRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();
connectDB();

const app = express();

// Nombre de proxys devant l'API (nginx = 1). Sert à lire la vraie IP des visiteurs. À ajuster au déploiement.
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));

app.use(helmet());
app.use(cors());
app.use(express.json());

// Santé de l'API : renvoie 503 si la base de données est injoignable (utile pour la surveillance)
app.get("/api/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ok" : "degraded", db: dbUp ? "up" : "down" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", commentRoutes);

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "MulterError") {
    return res.status(400).json({
      message: err.code === "LIMIT_FILE_SIZE" ? "Fichier trop volumineux" : err.message,
    });
  }
  res.status(500).json({ message: "Erreur serveur interne" });
});

// Évite qu'une promesse rejetée non gérée ne fasse tomber le serveur
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});