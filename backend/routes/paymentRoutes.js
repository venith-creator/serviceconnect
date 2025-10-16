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
  getProviderPaymentHistory, getCheckoutSessionStatus, getAllProviderPaymentHistory
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Payment creation and management
router.post("/create", protect, authorizeRoles("provider"), createPayment);
router.get("/earnings", protect, authorizeRoles("admin"), getProviderEarnings);
router.get("/session/:sessionId", protect, authorizeRoles("provider"), getCheckoutSessionStatus);
router.get("/provider", protect, authorizeRoles("provider"), getProviderPayments);
router.get("/history", protect, authorizeRoles("provider"), getProviderPaymentHistory);
router.get("/history/all", protect, authorizeRoles("admin"), getAllProviderPaymentHistory);
router.get("/admin", protect, authorizeRoles("admin"), getAllPaymentsAdmin);
router.put("/:id/status", protect, authorizeRoles("admin"), updatePaymentStatus);
router.get("/:id", protect, getPaymentById);
 // Webhook for Stripe events
router.post("/webhook", express.raw({ type: "application/json" }), handleStripeWebhook);

// Refund processing
router.post("/:id/refund", protect, authorizeRoles("admin"), processRefund);

// Provider payment status
router.get("/status", protect, authorizeRoles("provider"), getProviderPaymentStatus);

export default router;