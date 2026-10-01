import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // garde le fichier en mémoire pour l'envoyer à Cloudinary

const fileFilter = (req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error("Seules les images JPG/PNG/WEBP sont autorisées"), false);
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});