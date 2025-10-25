import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { getClientDashboardStats } from "../controllers/clientStatsController.js";

const router = express.Router();
router.get("/dashboard", protect, authorizeRoles("client"), getClientDashboardStats);
export default router;