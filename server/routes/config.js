import express from "express";
import {
  saveJiraConfig,
  saveConfluenceConfig,
  getConfigStatus,
  testConnection,
} from "../controllers/configController.js";

const router = express.Router();

router.post("/jira", saveJiraConfig);
router.post("/confluence", saveConfluenceConfig);
router.get("/status", getConfigStatus);
router.post("/test", testConnection);

export default router;
