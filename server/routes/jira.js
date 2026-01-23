import express from "express";
import { createIssue, getIssueStatus } from "../controllers/jiraController.js";

const router = express.Router();

router.post("/issues", createIssue);
router.get("/issues/:issueKey", getIssueStatus);

export default router;
