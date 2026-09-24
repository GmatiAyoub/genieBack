import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      req.user = null; // token invalide → on continue quand même en visiteur
    }
  } else {
    req.user = null;
  }

  next();
};