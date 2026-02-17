import jiraClient from "../services/jiraClient.js";
import { sanitizeErrorResponse, getErrorStatus } from "../utils/errorUtils.js";

// POST /api/jira/issues
export const createIssue = async (req, res) => {
  const { projectKey, summary, description, issueType } = req.body;

  if (!projectKey || !summary || !issueType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const response = await jiraClient.post("/rest/api/3/issue", {
      fields: {
        project: { key: projectKey },
        summary,
        description,
        issuetype: { name: issueType },
      },
    });
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(getErrorStatus(error)).json(sanitizeErrorResponse(error, 'Jira createIssue'));
  }
};

// GET /api/jira/issues/:issueKey
export const getIssueStatus = async (req, res) => {
  const { issueKey } = req.params;

  if (!issueKey) {
    return res.status(400).json({ error: "Missing issueKey" });
  }

  try {
    const response = await jiraClient.get(`/rest/api/3/issue/${issueKey}`);
    res.json({ success: true, data: response.data });
  } catch (error) {
    res.status(getErrorStatus(error)).json(sanitizeErrorResponse(error, 'Jira getIssueStatus'));
  }
};
