import "./env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import bodyParser from "body-parser";

import aiRoutes from "./routes/ai.js";
import { apiLimiter } from "./utils/rateLimiter.js";

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

// Security headers via helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    }
  },
  crossOriginEmbedderPolicy: false, // Allow loading resources from other origins
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Express server!" });
});

// Apply rate limiting
// Standard limiter for all /api routes (50 req/15min)
app.use("/api", apiLimiter);

// Routes
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
