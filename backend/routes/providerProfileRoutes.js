import express from "express";
import multer from "multer";
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  listAllProfiles,
  deleteProfile,
  getProviderStats,
  getProviderStatsAdmin,
  suspendProfile,
  getProviderStatus,
  approveProfile,
  rejectProvider,
  getActiveProviders,
  approveService,
  rejectService,
} from "../controllers/providerProfileController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { multiUpload } from "../middleware/upload.js";
const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("provider"),
  (req, res, next) => {
    multiUpload(req, res, function (err) {
      if (err) {
        console.error("Upload error:", err.message);
        return res.status(400).json({ message: err.message });
      }
      next(); // ✅ proceed only if upload succeeded
    });
  },
  createOrUpdateProfile
);

// Get my profile (provider)
router.get("/me", protect, authorizeRoles("provider"), getMyProfile);

// Public: list profiles
router.get("/", listAllProfiles);
router.get("/active", getActiveProviders);

// Public: get profile by id
router.get("/:id", getProfileById);
router.get("/:id/status", protect, authorizeRoles("provider", "admin"), getProviderStatus);

// Admin: delete, stats, suspend, approve
router.delete("/:id", protect, authorizeRoles("admin"), deleteProfile);
router.get("/stats/me", protect, authorizeRoles("provider"), getProviderStats);
router.get("/admin/:id", protect, authorizeRoles("admin"), getProviderStatsAdmin);
router.patch("/:id/suspend", protect, authorizeRoles("admin"), suspendProfile);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveProfile);
router.patch("/:id/reject", protect, authorizeRoles("admin"), rejectProvider);
router.patch("/:id/services/:serviceId/approve", protect, authorizeRoles("admin"), approveService);
router.patch("/:id/services/:serviceId/reject", protect, authorizeRoles("admin"), rejectService);

export default router;
