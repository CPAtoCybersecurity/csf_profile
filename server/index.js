import "./env.js";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import jiraRoutes from "./routes/jira.js";
import confluenceRoutes from "./routes/confluence.js";
import configRoutes from "./routes/config.js";
import apiLimiter from "./utils/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 4000;

// CORS configuration - restrict to known frontend origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like curl, Postman, or same-origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
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
