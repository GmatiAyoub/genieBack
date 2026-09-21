import express from "express";
import { login, createContributor, listContributors, deleteContributor } from "../controllers/authController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", login);

router.post("/users", protect, adminOnly, createContributor);
router.get("/users", protect, adminOnly, listContributors);
router.delete("/users/:id", protect, adminOnly, deleteContributor);

export default router;