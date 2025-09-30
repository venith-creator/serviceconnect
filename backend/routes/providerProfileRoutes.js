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
  getActiveProviders
} from "../controllers/providerProfileController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { upload, portfolioUpload, docUpload } from "../middleware/upload.js";


const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("provider"),
  (req, res, next) => {
    // combine multiple uploaders (docs, portfolio, avatar)
    const multiUpload = (req, res, cb) => {
      docUpload.array("docs", 10)(req, res, (err) => {
        if (err) return cb(err);
        portfolioUpload.array("portfolio", 10)(req, res, (err) => {
          if (err) return cb(err);
          upload.single("avatar")(req, res, (err) => {
            if (err) return cb(err);

            // ✅ Normalize so controller always has req.files.docs/portfolio/avatar
            req.files = {
              docs: req.files?.docs || [],
              portfolio: req.files?.portfolio || [],
              avatar: req.file ? [req.file] : (req.files?.avatar || []),
            };

            cb();
          });
        });
      });
    };
    multiUpload(req, res, next);
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

export default router;
