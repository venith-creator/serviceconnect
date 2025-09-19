// routes/portfolioRoutes.js
import express from "express";
import {
  createPortfolioItem,
  getPortfolioForProvider,
  likePortfolio,
  commentPortfolio,
  deletePortfolioItem
} from "../controllers/portfolioController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("provider"), createPortfolioItem);
router.get("/provider/:providerId", getPortfolioForProvider);
router.post("/:id/like", protect, likePortfolio);
router.post("/:id/comment", protect, commentPortfolio);
router.delete("/:id", protect, deletePortfolioItem);

export default router;
