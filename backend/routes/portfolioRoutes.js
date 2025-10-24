// routes/portfolioRoutes.js
import express from "express";
import {
  createPortfolioItem,
  getPortfolioForProvider,
  getMyPortfolio,
  likePortfolio,
  commentPortfolio,
  getAllPortfolios,
  deletePortfolioItem,
  addReply,
  toggleCommentLike,
  toggleReplyLike,
} from "../controllers/portfolioController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("provider"), createPortfolioItem);
router.get("/", getAllPortfolios);
router.get("/provider/me", protect, authorizeRoles("provider"), getMyPortfolio);
router.get("/provider/:providerId", getPortfolioForProvider);
router.post("/:id/like", protect, likePortfolio);
router.post("/:id/comment", protect, commentPortfolio);
router.delete("/:id", protect, deletePortfolioItem);
router.post("/:postId/comment/:commentId/reply", protect, addReply);
router.post("/:postId/comment/:commentId/like", protect, toggleCommentLike);
router.post("/:postId/comment/:commentId/reply/:replyId/like", protect, toggleReplyLike);

export default router;
