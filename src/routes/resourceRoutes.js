import express from "express";
import {
  createResource,
  listPublicResources,
  listPendingResources,
  validateResource,
  deleteResource,
  listMyResources,
} from "../controllers/resourceController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", listPublicResources); // public
router.get("/pending", protect, adminOnly, listPendingResources);
router.get("/mine", protect, listMyResources);
router.post("/", protect, upload.single("fichier"), createResource); // Contributeur ou Admin
router.patch("/:id/validate", protect, adminOnly, validateResource);
router.delete("/:id", protect, adminOnly, deleteResource);

export default router;