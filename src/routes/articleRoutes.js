import express from "express";
import {
  listArticles,
  listPendingArticles,
  listMyArticles,
  getArticle,
  createArticle,
  updateArticle,
  validateArticle,
  deleteArticle,
} from "../controllers/articleController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { cachePublic } from "../middlewares/cache.js";
const router = express.Router();

router.get("/", cachePublic(30), listArticles);
router.get("/pending", protect, adminOnly, listPendingArticles);
router.get("/mine", protect, listMyArticles);
router.get("/:id", getArticle);
router.post("/", protect, createArticle);
router.patch("/:id/validate", protect, adminOnly, validateArticle);
router.patch("/:id", protect, updateArticle);
router.delete("/:id", protect, adminOnly, deleteArticle);

export default router;