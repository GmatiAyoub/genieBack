import crypto from "crypto";
import path from "path";
import cloudinary from "../config/cloudinary.js";

// Upload un buffer vers Cloudinary (mode dossiers dynamiques).
// resourceType "image" pour les photos, "raw" pour les documents (PDF/DOC).
export const uploadBufferToCloudinary = (buffer, folder, resourceType = "auto", originalName = "") => {
  return new Promise((resolve, reject) => {
    const options = { asset_folder: folder, resource_type: resourceType };

    // Fichiers "raw" : l'extension doit faire partie de l'identifiant public,
    // sinon l'URL n'a pas d'extension et le navigateur télécharge un fichier sans type.
    if (resourceType === "raw") {
      const ext = path.extname(originalName).toLowerCase();
      options.public_id = `${crypto.randomBytes(10).toString("hex")}${ext}`;
    }

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
    stream.end(buffer);
  });
};