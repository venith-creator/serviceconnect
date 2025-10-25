// routes/adminRoutes.js
import express from "express";
import {
  listUsers,
  updateUserRole,
  toggleBanUser,
  getSystemStats,
  createAnnouncement,
  listAnnouncements,
  deleteAnnouncement,
  getAllHomeowners
} from "../controllers/adminController.js";
import { getAdminDashboard } from "../controllers/adminDashboardController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// user management
router.get("/dashboard", protect, authorizeRoles("admin"), getAdminDashboard);
router.get("/homeowners", protect, authorizeRoles("admin"), getAllHomeowners);
router.get("/users", protect, authorizeRoles("admin"), listUsers);
router.patch("/users/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.patch("/users/:id/ban", protect, authorizeRoles("admin"), toggleBanUser);

// stats
router.get("/stats", protect, authorizeRoles("admin"), getSystemStats);

// announcements
router.post("/announcements", protect, authorizeRoles("admin"), createAnnouncement);
router.get("/announcements", protect, authorizeRoles("admin"), listAnnouncements);
router.delete("/announcements/:id", protect, authorizeRoles("admin"), deleteAnnouncement);

export default router;
