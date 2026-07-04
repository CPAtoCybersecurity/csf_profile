// AI Routes
import express from "express";
import { handleClaudeRequest, getAIStatus } from "../controllers/aiController.js";
import { aiLimiter } from "../utils/rateLimiter.js";
import { claudeRequestValidation } from "../middlewares/validators/aiValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// GET /api/ai/status — configured flag + model name only; no key material
router.get("/status", aiLimiter, getAIStatus);

// POST /api/ai/claude
router.post("/claude", aiLimiter, claudeRequestValidation, validateRequest, handleClaudeRequest);

export default router;
