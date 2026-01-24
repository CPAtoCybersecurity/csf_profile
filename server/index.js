import "./env.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import helmet from "helmet";

import jiraRoutes from "./routes/jira.js";
import confluenceRoutes from "./routes/confluence.js";
import configRoutes from "./routes/config.js";
import apiLimiter from "./utils/rateLimiter.js"; 

const app = express();
const PORT = process.env.PORT || 4000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  frameguard: { action: 'deny' },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Express server!" });
});

// Apply rate limiter to all /api routes
app.use("/api", apiLimiter);

// Routes
app.use("/api/jira", jiraRoutes);
app.use("/api/confluence", confluenceRoutes);
app.use("/api/config", configRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
