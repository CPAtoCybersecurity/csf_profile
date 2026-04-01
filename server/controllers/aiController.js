export const handleClaudeRequest = async (req, res) => {
  try {
    const { prompt, maxTokens = 2500 } = req.body;

    // Validation
    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    if (maxTokens > 4000) {
      return res.status(400).json({ error: "maxTokens too large" });
    }

    // No API key configured
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(503).json({
        error: "Claude API not configured"
      });
    }

    // Timeout protection
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
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

    console.error("Claude proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};