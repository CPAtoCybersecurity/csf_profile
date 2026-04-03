/**
 * Claude AI Proxy Controller
 *
 * SECURITY:
 * - Claude API key is stored server-side only (env variable)
 * - No API keys are exposed to the client
 * - Prevents CWE-312 (cleartext exposure in browser)
 *
 * ARCHITECTURE:
 * - Frontend calls this endpoint
 * - Backend proxies request to Anthropic API
 *
 * NOTES:
 * - Request validation handled via express-validator middleware
 * - Rate limiting applied at route level
 */

import { getErrorStatus, sanitizeErrorResponse } from "../utils/errorUtils.js";

export const handleClaudeRequest = async (req, res) => {
  try {
    const { prompt, maxTokens = 2500 } = req.body;

    // Local development fallback if API key is not configured
    // Prevents blocking frontend development without real credentials
    if (!process.env.CLAUDE_API_KEY) {
      return res.json({
        result: "Mock response: Claude API not configured."
      });
    }

    // Config
    const TIMEOUT_MS = Number(process.env.CLAUDE_TIMEOUT_MS) || 60000;
    const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-20250514";

    // Timeout protection to avoid hanging requests (Claude responses can be slow)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Claude API error"
      });
    }

    const result = data?.content?.[0]?.text;

    if (!result) {
      return res.status(502).json({ error: "Invalid response from Claude" });
    }

    return res.json({ result });

  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Claude request timed out" });
    }

    return res
      .status(getErrorStatus(err))
      .json(sanitizeErrorResponse(err, "Claude proxy"));
  }
};
