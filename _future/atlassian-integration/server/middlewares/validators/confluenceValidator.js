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

// POST /api/confluence/mappings
export const saveMappingsValidation = [
  body()
    .custom((value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Request body must be a valid object");
      }
      return true;
    }),

  body()
    .custom((value) => {
      const requirementIdRegex = /^[A-Z]{2}\.[A-Z]{2}-\d{2}$/; // GV.OC-01
      const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      for (const [key, val] of Object.entries(value)) {
        if (!requirementIdRegex.test(key)) {
          throw new Error(`Invalid requirement ID format: ${key}`);
        }

        if (typeof val !== "string" || !guidRegex.test(val)) {
          throw new Error(`Invalid entry ID format for ${key}`);
        }
      }

      return true;
    })
];
