import axios from "axios";

const baseURL = process.env.JIRA_BASE_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;

if (!baseURL || !email || !token) {
  console.error("Missing Jira environment variables");
}

const authHeader = Buffer.from(`${email}:${token}`).toString("base64");

const jiraClient = axios.create({
  baseURL,
  headers: {
    "Authorization": `Basic ${authHeader}`,
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

export default jiraClient;
