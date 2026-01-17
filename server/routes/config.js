import express from "express";
import {
  saveJiraConfig,
  saveConfluenceConfig,
  getConfigStatus,
} from "../controllers/configController.js";

const router = express.Router();

router.post("/jira", saveJiraConfig);
router.post("/confluence", saveConfluenceConfig);
router.get("/status", getConfigStatus);

export default router;
