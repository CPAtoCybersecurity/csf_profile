import axios from "axios";

const baseURL = process.env.CONFLUENCE_BASE_URL;
const email = process.env.CONFLUENCE_EMAIL;
const token = process.env.CONFLUENCE_API_TOKEN;

<<<<<<< HEAD
// Safety check (helps debugging)
if (!baseURL || !email || !token) {
  console.error("Missing Confluence environment variables");
}

const authHeader = Buffer
  .from(`${email}:${token}`)
  .toString("base64");

const confluenceClient = axios.create({
  baseURL,
=======
// Track configuration status
const isConfigured = !!(baseURL && email && token);

if (!isConfigured) {
  console.warn(
    "⚠️  Confluence environment variables not configured. " +
    "Set CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN to enable Confluence integration."
  );
}

const authHeader = isConfigured
  ? Buffer.from(`${email}:${token}`).toString("base64")
  : "";

const confluenceClient = axios.create({
  baseURL: baseURL || "https://not-configured.atlassian.net",
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
  headers: {
    "Authorization": `Basic ${authHeader}`,
    "Accept": "application/json",
  },
  timeout: 10000,
});

<<<<<<< HEAD
=======
// Add request interceptor to check configuration before making requests
confluenceClient.interceptors.request.use(
  (config) => {
    if (!isConfigured) {
      return Promise.reject(
        new Error("Confluence is not configured. Please set CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_TOKEN environment variables.")
      );
    }
    return config;
  },
  (error) => Promise.reject(error)
);

>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
export default confluenceClient;
