// Cache mémoire pour les lectures publiques (listes de ressources, livres, articles, commentaires).
// Réduit fortement le nombre d'opérations envoyées à MongoDB Atlas.

const store = new Map(); // clé (URL) -> { expires, body }
const MAX_ENTRIES = 500;

// Met en cache la réponse JSON d'une route GET publique pendant ttlSeconds secondes.
// À utiliser uniquement sur des routes dont la réponse ne dépend pas de l'utilisateur connecté.
export const cachePublic = (ttlSeconds = 30) => (req, res, next) => {
  if (req.method !== "GET") return next();

  const key = req.originalUrl;
  const hit = store.get(key);

  if (hit && hit.expires > Date.now()) {
    res.set("X-Cache", "HIT");
    return res.status(200).type("application/json").send(hit.body);
  }

  const sendJson = res.json.bind(res);
  res.json = (data) => {
    if (res.statusCode === 200) {
      if (store.size >= MAX_ENTRIES) store.delete(store.keys().next().value);
      store.set(key, { expires: Date.now() + ttlSeconds * 1000, body: JSON.stringify(data) });
      res.set("X-Cache", "MISS");
    }
    return sendJson(data);
  };
  next();
};

// Vide le cache après toute écriture réussie sur les ressources, livres, articles ou commentaires
const PUBLIC_DATA = /^\/api\/(resources|books|articles|comments)(\/|\?|$)/;

export const invalidateOnWrite = (req, res, next) => {
  if (req.method !== "GET" && PUBLIC_DATA.test(req.originalUrl)) {
    res.on("finish", () => {
      if (res.statusCode < 400) store.clear();
    });
  }
  next();
};