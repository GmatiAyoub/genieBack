import express from "express";
import { createOrder, listOrders, processOrder, togglePayment } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { orderLimiter } from "../middlewares/rateLimiters.js";

const router = express.Router();

router.post("/",orderLimiter, createOrder);
router.get("/", protect, adminOnly, listOrders);
router.patch("/:id/process", protect, adminOnly, processOrder);
router.patch("/:id/payment", protect, adminOnly, togglePayment);

export default router;