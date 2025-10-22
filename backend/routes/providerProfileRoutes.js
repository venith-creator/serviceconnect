import express from "express";
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
  getServicesRequiringPayment, getProviderServices,
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
      next();
    });
  },
  createOrUpdateProfile
);

router.get("/me", protect, authorizeRoles("provider"), getMyProfile);

// Get all services for the current provider
router.get("/me/services", protect, authorizeRoles("provider"), getProviderServices);

router.get("/payment-required", protect, authorizeRoles("provider"), getServicesRequiringPayment);
router.get("/", protect, listAllProfiles);
router.get("/active", getActiveProviders);

router.get("/provider-status", protect, getProviderStatus);
router.get("/:id", getProfileById);

router.delete("/:id", protect, authorizeRoles("admin"), deleteProfile);
router.get("/stats/me", protect, authorizeRoles("provider"), getProviderStats);
router.get("/admin/:id", protect, authorizeRoles("admin"), getProviderStatsAdmin);
router.patch("/:id/suspend", protect, authorizeRoles("admin"), suspendProfile);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveProfile);
router.patch("/:id/reject", protect, authorizeRoles("admin"), rejectProvider);
router.patch("/:id/services/:serviceId/approve", protect, authorizeRoles("admin"), approveService);
router.patch("/:id/services/:serviceId/reject", protect, authorizeRoles("admin"), rejectService);

export default router;
