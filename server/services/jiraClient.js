import axios from "axios";

const baseURL = process.env.JIRA_BASE_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;

// Track configuration status
const isConfigured = !!(baseURL && email && token);

if (!isConfigured) {
  console.warn(
    "⚠️  Jira environment variables not configured. " +
    "Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN to enable Jira integration."
  );
}

const authHeader = isConfigured
  ? Buffer.from(`${email}:${token}`).toString("base64")
  : "";

const jiraClient = axios.create({
  baseURL: baseURL || "https://not-configured.atlassian.net",
  headers: {
    "Authorization": `Basic ${authHeader}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add request interceptor to check configuration before making requests
jiraClient.interceptors.request.use(
  (config) => {
    if (!isConfigured) {
      return Promise.reject(
        new Error("Jira is not configured. Please set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.")
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default jiraClient;
