import express from "express";
import { createIssue, getIssueStatus } from "../controllers/jiraController.js";
import { createIssueValidation } from "../middlewares/validators/jiraValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// POST /issues - validate request body
router.post("/issues", createIssueValidation, validateRequest, createIssue);

// GET /issues/:issueKey - no validator added (optional for later)
router.get("/issues/:issueKey", getIssueStatus);

export default router;
