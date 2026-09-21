import express from "express";
import {
  listBooks,
  getBook,
  listPendingBooks,
  listMyBooks,
  createBook,
  updateBook,
  validateBook,
  deleteBook,
} from "../controllers/bookController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../middlewares/uploadImageMiddleware.js";

const router = express.Router();

router.get("/", listBooks);
router.get("/pending", protect, adminOnly, listPendingBooks);
router.get("/mine", protect, listMyBooks);
router.get("/:id", getBook);
router.post("/", protect, uploadImage.single("image"), createBook);
router.patch("/:id/validate", protect, adminOnly, validateBook);
router.patch("/:id", protect, uploadImage.single("image"), updateBook);
router.delete("/:id", protect, adminOnly, deleteBook);

export default router;