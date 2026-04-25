import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  getSessionDetails,
  joinSession,
  joinByInviteCode,
  saveCodeSnapshot,
  saveExecutionResult,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

router.post("/join/code/:inviteCode", protectRoute, joinByInviteCode);

router.get("/:id", protectRoute, getSessionById);
router.get("/:id/details", protectRoute, getSessionDetails);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/:id/save-code", protectRoute, saveCodeSnapshot);
router.post("/:id/save-execution", protectRoute, saveExecutionResult);

export default router;
