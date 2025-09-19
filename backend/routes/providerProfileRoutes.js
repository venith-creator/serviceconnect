// backend/routes/providerProfileRoutes.js
import express from "express";
import {
  createOrUpdateProfile,
  getMyProfile,
  getProfileById,
  listAllProfiles,
  deleteProfile, getProviderStats, getProviderStatsAdmin, suspendProfile, approveProfile, getActiveProviders
} from "../controllers/providerProfileController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create or update profile (provider only)
router.post("/", protect, authorizeRoles("provider"), createOrUpdateProfile);

// Get my profile (provider)
router.get("/me", protect, authorizeRoles("provider"), getMyProfile);

// Public: list profiles (with optional filters)
router.get("/", listAllProfiles);
router.get("/active", getActiveProviders);

// Public: get profile by id
router.get("/:id", getProfileById);

// Admin: delete a profile
router.delete("/:id", protect, authorizeRoles("admin"), deleteProfile);
// Stats for provider
router.get("/stats/me", protect, authorizeRoles("provider"), getProviderStats);

// Admin: view provider stats
router.get("/admin/:id", protect, authorizeRoles("admin"), getProviderStatsAdmin);

// Admin: suspend profile
router.patch("/:id/suspend", protect, authorizeRoles("admin"), suspendProfile);
router.patch("/:id/approve", protect, authorizeRoles(["admin"]), approveProfile);

export default router;
