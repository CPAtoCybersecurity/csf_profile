import axios from "axios";

const baseURL = process.env.CONFLUENCE_BASE_URL;
const email = process.env.CONFLUENCE_EMAIL;
const token = process.env.CONFLUENCE_API_TOKEN;

// Safety check (helps debugging)
if (!baseURL || !email || !token) {
  console.error("Missing Confluence environment variables");
}

const authHeader = Buffer
  .from(`${email}:${token}`)
  .toString("base64");

const confluenceClient = axios.create({
  baseURL,
  headers: {
    "Authorization": `Basic ${authHeader}`,
    "Accept": "application/json",
  },
  timeout: 10000,
});

export default confluenceClient;
