// server/controllers/configController.js
// Config endpoints now read credentials from environment variables only.
// No credentials are written to the filesystem.

// Validation helper
const validateConfigFields = (config, requiredFields) => {
  const missing = requiredFields.filter((field) => !config[field]);
  return missing.length > 0 ? missing : null;
};

// Helper to mask sensitive data
const maskToken = (token) => {
  if (!token || token.length < 8) return token ? '****' : '';
  return token.slice(0, 4) + '****' + token.slice(-4);
};

const getEnvConfig = () => {
  const config = {};
  if (process.env.JIRA_BASE_URL || process.env.JIRA_EMAIL || process.env.JIRA_API_TOKEN) {
    config.jira = {
      baseUrl: process.env.JIRA_BASE_URL || '',
      email: process.env.JIRA_EMAIL || '',
      apiToken: process.env.JIRA_API_TOKEN || '',
    };
  }
  if (process.env.CONFLUENCE_BASE_URL || process.env.CONFLUENCE_EMAIL || process.env.CONFLUENCE_API_TOKEN) {
    config.confluence = {
      baseUrl: process.env.CONFLUENCE_BASE_URL || '',
      email: process.env.CONFLUENCE_EMAIL || '',
      apiToken: process.env.CONFLUENCE_API_TOKEN || '',
    };
  }
  if (process.env.CLAUDE_API_KEY) {
    config.ai = {
      provider: "claude",
      apiKey: process.env.CLAUDE_API_KEY,
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514"
    };
  }
  if (process.env.CONFLUENCE_BASE_URL || process.env.CONFLUENCE_SPACE_KEY || process.env.CONFLUENCE_REQUIREMENTS_DB_ID) {
    config.confluenceMeta = {
      baseUrl: process.env.CONFLUENCE_BASE_URL || '',
      spaceKey: process.env.CONFLUENCE_SPACE_KEY || '',
      requirementsDbId: process.env.CONFLUENCE_REQUIREMENTS_DB_ID || '',
      controlsDbId: process.env.CONFLUENCE_CONTROLS_DB_ID || ''
    };
  }
  return config;
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
  if (config.ai) {
    masked.ai = {
      provider: config.ai.provider,
      model: config.ai.model,
      apiKey: maskToken(config.ai.apiKey),
      configured: !!config.ai.apiKey
    };
  }
  if (config.confluenceMeta) {
    masked.confluenceMeta = {
      baseUrl: config.confluenceMeta.baseUrl,
      spaceKey: config.confluenceMeta.spaceKey,
      requirementsDbId: config.confluenceMeta.requirementsDbId,
      controlsDbId: config.confluenceMeta.controlsDbId,
      configured: !!(config.confluenceMeta.baseUrl && config.confluenceMeta.spaceKey && config.confluenceMeta.requirementsDbId)
    };
  }
  return masked;
};

// POST /api/config/jira — validates env var config, does not store credentials
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

  // Credentials must be set via environment variables, not stored on disk
  res.json({
    success: true,
    message: "Jira credentials must be configured via JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.",
    data: maskConfig(getEnvConfig())
  });
};

// POST /api/config/confluence — validates env var config, does not store credentials
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

  res.json({
    success: true,
    message: "Confluence credentials must be configured via CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN environment variables.",
    data: maskConfig(getEnvConfig())
  });
};

// POST /api/config/ai
export const saveAIConfig = (req, res) => {
  const config = req.body;

  if (!config || typeof config !== "object") {
    return res.status(400).json({ error: "Missing AI config data" });
  }

  if (!process.env.CLAUDE_API_KEY) {
    return res.status(400).json({
      error: "Claude API key must be set via CLAUDE_API_KEY environment variable"
    });
  }

  res.json({
    success: true,
    message: "Claude configuration is managed via environment variables.",
    data: maskConfig(getEnvConfig())
  });
};

// GET /api/config/status
export const getConfigStatus = (req, res) => {
  try {
    const config = getEnvConfig();
    res.json({ success: true, data: maskConfig(config) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Failed to read config" });
  }
};

// POST /api/config/test - Test Atlassian connection using provided credentials
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
      res.status(response.status).json({
        success: false,
        error: "Connection failed. Please verify credentials and permissions."
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Connection error. Please try again."
    });
  }
};
