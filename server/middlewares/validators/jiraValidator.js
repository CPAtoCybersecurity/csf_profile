import { body, param } from "express-validator";

// Validator for GET /api/jira/issues/:issueKey
export const getIssueValidation = [
  param("issueKey")
    .matches(/^[A-Z0-9]+-[0-9]+$/)
    .withMessage("Invalid Jira issue key format (e.g., PROJ-123)")
];

// Validator for POST /api/jira/issues
export const createIssueValidation = [
  body("projectKey")
    .isLength({ min: 1, max: 50 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage("projectKey must be uppercase alphanumeric, max 50 chars"),

  body("summary")
    .isLength({ min: 1, max: 255 })
    .trim()
    .escape()
    .withMessage("summary is required, max 255 chars"),

  body("issueType")
    .isIn(["Bug", "Story", "Task", "Epic"])
    .withMessage("issueType must be Bug, Story, Task, or Epic"),

  body("description")
    .optional()
    .custom((value) => typeof value === "string" || typeof value === "object")
    .withMessage("description must be string or object")
];