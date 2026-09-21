import express from "express";
import { createOrder, listOrders, processOrder } from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", createOrder); // public
router.get("/", protect, adminOnly, listOrders);
router.patch("/:id/process", protect, adminOnly, processOrder);

export default router;