import express from "express";
import {
  login,
  changePassword,
  createContributor,
  listContributors,
  deleteContributor,
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { loginLimiter, passwordLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/login", loginLimiter, login);
router.patch("/password", protect, passwordLimiter, changePassword);

router.post("/users", protect, adminOnly, createContributor);
router.get("/users", protect, adminOnly, listContributors);
router.delete("/users/:id", protect, adminOnly, deleteContributor);

export default router;