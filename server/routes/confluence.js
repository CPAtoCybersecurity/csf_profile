import express from "express";
import { getPage, validateConfluence } from "../controllers/confluenceController.js";
import { getPageValidation, validateConfluenceValidation } from "../middlewares/validators/confluenceValidator.js";
import { validateRequest } from "../middlewares/validators/validateRequest.js";

const router = express.Router();

// GET /page/:pageId - Validates alphanumeric page ID
router.get("/page/:pageId", getPageValidation, validateRequest, getPage);

// POST /validate - Validates Jira/Confluence credentials and baseUrl
router.post("/validate", validateConfluenceValidation, validateRequest, validateConfluence);

export default router;