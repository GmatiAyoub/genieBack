// Valide un numéro de téléphone tunisien : 8 chiffres commençant par 2, 4, 5, 7 ou 9,
// avec ou sans indicatif +216 / 216
export const isValidTunisianPhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\s/g, ""); // retire les espaces éventuels
  const regex = /^(\+216|216)?[24579]\d{7}$/;
  return regex.test(cleaned);
};