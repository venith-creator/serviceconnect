// backend/routes/jobRoutes.js
import express from "express";
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
  markJobCompleted,
  getAllJobsAdmin, getJobByIdExcludeProposals, getCompletedJobsForClient, getCompletedJobsForProvider
} from "../controllers/jobsController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { attachmentUpload } from "../middleware/upload.js";  // ✅ use central uploader

const router = express.Router();

/**
 * CLIENT ROUTES
 */

// Create a new job (client only, with file uploads)
router.post("/", attachmentUpload.array("attachments", 10), createJob);

// Get all jobs (public)
router.get("/", getJobs);
router.get("/completed", protect, getCompletedJobsForClient);
router.get("/completed/provider", protect, getCompletedJobsForProvider);

// Get my jobs (client)
router.get("/my", protect, authorizeRoles("client"), getMyJobs);
/**
 * ADMIN ROUTES
 */
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllJobsAdmin
);
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


router.get("/:id/all", getJobByIdExcludeProposals);

// Get, update, delete a specific job (client)
router
  .route("/:id")
  .get(getJobById)
  .put(protect, authorizeRoles("client"), updateJob)
  .delete(protect, authorizeRoles("client"), deleteJob);

// Assign a provider (client)
router.patch("/:id/assign", protect, authorizeRoles("client"), assignProvider);
router.patch(
  "/:id/complete",
  protect,
  authorizeRoles("client"),
  markJobCompleted
);

export default router;
