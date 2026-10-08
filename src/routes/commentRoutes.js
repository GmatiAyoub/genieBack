import express from "express";
import { listComments, createComment, updateComment, deleteComment } from "../controllers/commentController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.js";
import { commentLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.get("/articles/:id/comments", listComments);
router.post("/articles/:id/comments", commentLimiter, optionalAuth, createComment);
router.patch("/comments/:id", optionalAuth, updateComment);
router.delete("/comments/:id", protect, adminOnly, deleteComment);

export default router;