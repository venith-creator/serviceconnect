// routes/chatRoutes.js
import express from "express";
import {
  createOrGetRoom,
  createClientProviderRoom,
  getRoomsForUser,
  markRoomAsRead,
  getMessagesForRoom,
  sendMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/room", protect, createOrGetRoom); // create/get room (body: participants[], jobId)
router.get("/rooms", protect, getRoomsForUser);
router.get("/room/:roomId/messages", protect, getMessagesForRoom);
router.post("/room/:roomId/message", protect, sendMessage);
router.post("/room/client-provider", protect, createClientProviderRoom);
router.patch("/room/:roomId/read", protect, markRoomAsRead);
export default router;
