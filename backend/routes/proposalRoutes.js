import express from "express";
import {
  createProposal,
  getProposalsForJob,
  getMyProposals,
  updateProposal,
  getAllProposals,
  withdrawProposal, acceptProposal,
  deleteProposal
} from "../controllers/proposalController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles(["provider"]), createProposal);
router.get("/my", protect, authorizeRoles(["provider"]), getMyProposals);
router.get("/job/:jobId", protect, authorizeRoles(["client", "admin"]), getProposalsForJob);
router.get("/admin", protect, authorizeRoles(["admin"]), getAllProposals);

router.route("/:id")
  .put(protect, authorizeRoles(["provider"]), updateProposal)
  .delete(protect, authorizeRoles(["provider"]), deleteProposal);
router.patch("/:id/accept", protect, authorizeRoles(["client"]), acceptProposal);
router.patch("/:id/withdraw", protect, authorizeRoles(["provider"]), withdrawProposal);
export default router;
