import cloudinary from "../config/cloudinary.js";

// Upload un buffer vers Cloudinary (mode dossiers dynamiques).
// resourceType "image" pour les photos, "raw" pour les documents (PDF/DOC).
export const uploadBufferToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { asset_folder: folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};