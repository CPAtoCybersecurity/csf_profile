// server/middleware/configAuth.js
// Shared-secret authentication for sensitive config endpoints.
// Requires CONFIG_API_KEY environment variable to be set.
// All requests to /api/config/* must include header: X-Config-Key: <key>

const configAuth = (req, res, next) => {
  const configKey = process.env.CONFIG_API_KEY;

  if (!configKey) {
    return res.status(503).json({
      error: "Configuration API is disabled. Set CONFIG_API_KEY environment variable to enable."
    });
  }

  const provided = req.headers["x-config-key"];

  if (!provided || provided !== configKey) {
    return res.status(401).json({ error: "Unauthorized. Valid X-Config-Key header required." });
  }

  next();
};

export default configAuth;
