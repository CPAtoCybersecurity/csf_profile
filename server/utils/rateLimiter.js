// utils/rateLimiter.js
import rateLimit from 'express-rate-limit';

// Standard rate limiter for general API endpoints
// Reduced from 100 to 50 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for sensitive endpoints (config, validation)
// 10 requests per 15 minutes
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests to sensitive endpoint, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Very strict limiter for validation/auth-like endpoints
// 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Export default for backwards compatibility
export default apiLimiter;
