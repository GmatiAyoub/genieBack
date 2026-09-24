import express from "express";
import { listNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listNotifications);
router.patch("/:id/read", protect, markAsRead);
router.patch("/read-all", protect, markAllAsRead);

export default router;