import express from "express";
import { listComments, createComment, updateComment, deleteComment } from "../controllers/commentController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { commentLimiter } from "../middlewares/rateLimiters.js";
import { cachePublic } from "../middlewares/cache.js";

const router = express.Router();

router.get("/articles/:id/comments", cachePublic(30), listComments);
router.post("/articles/:id/comments", commentLimiter, optionalAuth, createComment);
router.patch("/comments/:id", optionalAuth, updateComment);
router.delete("/comments/:id", protect, adminOnly, deleteComment);

export default router;