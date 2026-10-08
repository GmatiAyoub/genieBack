import rateLimit from "express-rate-limit";

const build = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

// 10 échecs de connexion max par IP toutes les 15 minutes (les connexions réussies ne comptent pas)
export const loginLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { message: "Trop de tentatives de connexion. Réessayez dans 15 minutes." },
});

// Commandes publiques : 10 par heure par IP
export const orderLimiter = build({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: { message: "Trop de commandes envoyées. Réessayez plus tard." },
});

// Commentaires publics : 30 par 15 minutes par IP
export const commentLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: "Trop de commentaires envoyés. Réessayez dans quelques minutes." },
});