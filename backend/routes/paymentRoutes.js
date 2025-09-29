import express from "express";
import { createSubscriptionPayment, getProviderPayments, getAllPaymentsAdmin, updatePaymentStatus, getPaymentById, getProviderEarnings } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";   

const router = express.Router();

// Provider: create subscription payment
router.post("/subscribe", protect, authorizeRoles("provider"), createSubscriptionPayment);
router.get("/my", protect, authorizeRoles("provider"), getProviderPayments);

// Admin: all payments, update status
router.get("/", protect, authorizeRoles("admin"), getAllPaymentsAdmin);
router.patch("/:id/status", protect, authorizeRoles("admin"), updatePaymentStatus);
router.get("/:id", protect, authorizeRoles("admin"), getPaymentById);
router.get("/earnings/me", protect, authorizeRoles("provider"), getProviderEarnings);

export default router;