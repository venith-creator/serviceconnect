import express from "express";
import { getProviderDashboard } from "../controllers/providerDashboardController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard/:providerId", protect, getProviderDashboard);

export default router;
