// backend/routes/jobRoutes.js
import express from "express";
import multer from "multer";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs,
  forceCompleteJob,
  cancelJobByAdmin,
  assignProvider,
} from "../controllers/jobsController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// 🔹 Multer storage (for job attachments)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // central uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

/**
 * CLIENT ROUTES
 */

// Create a new job (client only, with file uploads)
router.post(
  "/",
  protect,
  authorizeRoles("client"),
  upload.array("attachments", 10),
  createJob
);

// Get all jobs (public)
router.get("/", getJobs);

// Get my jobs (client)
router.get("/my", protect, authorizeRoles("client"), getMyJobs);

// Get, update, delete a specific job (client)
router
  .route("/:id")
  .get(getJobById)
  .put(protect, authorizeRoles("client"), updateJob)
  .delete(protect, authorizeRoles("client"), deleteJob);

// Assign a provider (client)
router.patch("/:id/assign", protect, authorizeRoles("client"), assignProvider);

/**
 * ADMIN ROUTES
 */
router.patch(
  "/:id/force-complete",
  protect,
  authorizeRoles("admin"),
  forceCompleteJob
);
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("admin"),
  cancelJobByAdmin
);

export default router;
