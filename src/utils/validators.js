// Téléphone tunisien : 8 chiffres commençant par 2, 4, 5, 7 ou 9, avec ou sans +216 / 216
export const isValidTunisianPhone = (phone) => {
  if (typeof phone !== "string") return false; // refuse aussi les nombres/objets envoyés en JSON
  const cleaned = phone.replace(/\s/g, "");
  return /^(\+216|216)?[24579]\d{7}$/.test(cleaned);
};

export const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// 12 caractères minimum pour l'admin, 8 pour les contributeurs.
// 72 octets maximum : bcrypt ignore tout ce qui dépasse.
export const passwordError = (password, role) => {
  if (typeof password !== "string" || password.length === 0) return "Mot de passe requis";
  const min = role === "admin" ? 12 : 8;
  if (password.length < min) return `Le mot de passe doit contenir au moins ${min} caractères`;
  if (Buffer.byteLength(password, "utf8") > 72) return "Le mot de passe est trop long (72 octets maximum)";
  return null;
};