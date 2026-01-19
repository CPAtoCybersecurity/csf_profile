// server/controllers/configController.js

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory path relative to this file (works regardless of cwd)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "..", "config.json");

// Validation helper
const validateConfigFields = (config, requiredFields) => {
  const missing = requiredFields.filter((field) => !config[field]);
  return missing.length > 0 ? missing : null;
};

// POST /api/config/jira
export const saveJiraConfig = (req, res) => {
  const config = req.body;
  if (!config || typeof config !== "object") {
    return res.status(400).json({ error: "Missing Jira config data" });
  }

  const missingFields = validateConfigFields(config, ["baseUrl", "email", "apiToken"]);
  if (missingFields) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  saveConfig({ jira: config }, res);
};

// POST /api/config/confluence
export const saveConfluenceConfig = (req, res) => {
  const config = req.body;
  if (!config || typeof config !== "object") {
    return res.status(400).json({ error: "Missing Confluence config data" });
  }

  const missingFields = validateConfigFields(config, ["baseUrl", "email", "apiToken"]);
  if (missingFields) {
    return res.status(400).json({
      error: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  saveConfig({ confluence: config }, res);
};

// Helper to mask sensitive data
const maskToken = (token) => {
  if (!token || token.length < 8) return token ? '****' : '';
  return token.slice(0, 4) + '****' + token.slice(-4);
};

const maskConfig = (config) => {
  const masked = {};
  if (config.jira) {
    masked.jira = {
      baseUrl: config.jira.baseUrl || '',
      email: config.jira.email || '',
      apiToken: maskToken(config.jira.apiToken),
      configured: !!(config.jira.baseUrl && config.jira.email && config.jira.apiToken)
    };
  }
  if (config.confluence) {
    masked.confluence = {
      baseUrl: config.confluence.baseUrl || '',
      email: config.confluence.email || '',
      apiToken: maskToken(config.confluence.apiToken),
      configured: !!(config.confluence.baseUrl && config.confluence.email && config.confluence.apiToken)
    };
  }
  return masked;
};

// GET /api/config/status
export const getConfigStatus = (req, res) => {
  try {
    const data = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, "utf-8"))
      : {};
    // Return masked config - never expose full API tokens
    res.json({ success: true, data: maskConfig(data) });
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
    // Return masked config, not the actual tokens
    res.json({ success: true, data: maskConfig(merged) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to save config" });
  }
};

// POST /api/config/test - Test Atlassian connection without storing credentials
export const testConnection = async (req, res) => {
  const { service, baseUrl, email, apiToken } = req.body;

  if (!service || !baseUrl || !email || !apiToken) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: service, baseUrl, email, apiToken"
    });
  }

  if (!['jira', 'confluence'].includes(service)) {
    return res.status(400).json({
      success: false,
      error: "Service must be 'jira' or 'confluence'"
    });
  }

  try {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const testUrl = service === 'jira'
      ? `${baseUrl}/rest/api/3/myself`
      : `${baseUrl}/wiki/rest/api/user/current`;

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      res.json({
        success: true,
        message: `Connected successfully as ${userData.displayName || userData.emailAddress || email}`,
        user: {
          displayName: userData.displayName,
          email: userData.emailAddress
        }
      });
    } else {
      const errorText = await response.text();
      res.status(response.status).json({
        success: false,
        error: `Connection failed: ${response.status} ${response.statusText}`,
        details: errorText.substring(0, 200)
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Connection error: ${error.message}`
    });
  }
};
