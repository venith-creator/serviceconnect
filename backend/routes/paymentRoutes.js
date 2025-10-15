import express from "express";
import {
  createPayment,
  getProviderPayments,
  getAllPaymentsAdmin,
  updatePaymentStatus,
  getPaymentById,
  getProviderEarnings,
  handleStripeWebhook,
  processRefund,
  getProviderPaymentStatus,
  getProviderPaymentHistory, getCheckoutSessionStatus
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Payment creation and management
router.post("/create", protect, authorizeRoles("provider"), createPayment);
router.get("/session/:sessionId", protect, authorizeRoles("provider"), getCheckoutSessionStatus);
router.get("/provider", protect, authorizeRoles("provider"), getProviderPayments);
router.get("/history", protect, authorizeRoles("provider"), getProviderPaymentHistory);
router.get("/admin", protect, authorizeRoles("admin"), getAllPaymentsAdmin);
router.put("/:id/status", protect, authorizeRoles("admin"), updatePaymentStatus);
router.get("/:id", protect, getPaymentById);
router.get("/earnings", protect, authorizeRoles("provider"), getProviderEarnings);
 // Webhook for Stripe events
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Refund processing
router.post("/:id/refund", protect, authorizeRoles("admin"), processRefund);

// Provider payment status
router.get("/status", protect, authorizeRoles("provider"), getProviderPaymentStatus);

export default router;