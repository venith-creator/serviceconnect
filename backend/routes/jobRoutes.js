import express from "express";
import { createJob, getJobs, getJobById, updateJob, deleteJob, getMyJobs, forceCompleteJob, cancelJobByAdmin, assignProvider } from "../controllers/jobsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getJobs)
  .post(protect, authorizeRoles(["client"]), createJob);
router.get("/my", protect, getMyJobs);

router.route("/:id")
  .get(getJobById)
  .put(protect, authorizeRoles(["client"]), updateJob)
  .delete(protect, authorizeRoles(["client"]), deleteJob);

router.patch("/:id/force-complete", protect, authorizeRoles(["admin"]), forceCompleteJob);
router.patch("/:id/cancel", protect, authorizeRoles(["admin"]), cancelJobByAdmin);
router.patch("/:id/assign", protect, authorizeRoles(["client"]), assignProvider);


export default router;
