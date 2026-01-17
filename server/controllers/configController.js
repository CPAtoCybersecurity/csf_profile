// server/controllers/configController.js

import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "config.json");

// POST /api/config/jira
export const saveJiraConfig = (req, res) => {
  const config = req.body;
  if (!config) return res.status(400).json({ error: "Missing Jira config data" });

  saveConfig({ jira: config }, res);
};

// POST /api/config/confluence
export const saveConfluenceConfig = (req, res) => {
  const config = req.body;
  if (!config) return res.status(400).json({ error: "Missing Confluence config data" });

  saveConfig({ confluence: config }, res);
};

// GET /api/config/status
export const getConfigStatus = (req, res) => {
  try {
    const data = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
      : {};
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to read config" });
  }
};

// Helper to merge & save config
const saveConfig = (newConfig, res) => {
  try {
    const existingConfig = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
      : {};
    const merged = { ...existingConfig, ...newConfig };
    fs.writeFileSync(configPath, JSON.stringify(merged, null, 2));
    res.json({ success: true, data: merged });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to save config" });
  }
};
