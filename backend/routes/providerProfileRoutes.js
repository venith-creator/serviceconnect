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
  approveProfile,
  getActiveProviders
} from "../controllers/providerProfileController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🔹 Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // central uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Create or update profile (provider only, with file uploads)
router.post(
  "/",
  protect,
  authorizeRoles("provider"),
  upload.fields([
    { name: "docs", maxCount: 10 },
    { name: "portfolio", maxCount: 10 },
    { name: "avatar", maxCount: 1 }
  ]),
  createOrUpdateProfile
);

// Get my profile (provider)
router.get("/me", protect, authorizeRoles("provider"), getMyProfile);

// Public: list profiles
router.get("/", listAllProfiles);
router.get("/active", getActiveProviders);

// Public: get profile by id
router.get("/:id", getProfileById);

// Admin: delete, stats, suspend, approve
router.delete("/:id", protect, authorizeRoles("admin"), deleteProfile);
router.get("/stats/me", protect, authorizeRoles("provider"), getProviderStats);
router.get("/admin/:id", protect, authorizeRoles("admin"), getProviderStatsAdmin);
router.patch("/:id/suspend", protect, authorizeRoles("admin"), suspendProfile);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveProfile);

export default router;
