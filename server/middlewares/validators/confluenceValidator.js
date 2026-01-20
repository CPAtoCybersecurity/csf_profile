import { param, body } from "express-validator";

// GET /api/confluence/page/:pageId - Validates alphanumeric page ID
export const getPageValidation = [
  param("pageId")
    .isAlphanumeric()
    .withMessage("pageId must be alphanumeric")
];

// POST /api/confluence/validate - Validates URL, email, and API token
export const validateConfluenceValidation = [
  body("baseUrl")
    .isURL({ require_tld: false, require_protocol: true })
    .withMessage("A valid baseUrl (including protocol) is required"),
  
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
    
  body("apiToken")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("apiToken is required")
];