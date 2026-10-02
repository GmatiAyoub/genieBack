import cloudinary from "../config/cloudinary.js";

// Upload un buffer vers Cloudinary.
// resourceType "image" pour les photos, "raw" pour les documents (PDF/DOC) — évite le blocage de sécurité sur les PDF.
export const uploadBufferToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};