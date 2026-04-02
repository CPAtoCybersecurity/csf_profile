/**
 * Claude Request Validation
 *
 * Ensures:
 * - prompt is a non-empty string
 * - prompt size is within safe limits
 * - maxTokens is within supported Claude limits
 * 
 */

import { body } from "express-validator";

export const claudeRequestValidation = [
  body("prompt")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("prompt must be a non-empty string")
    .isLength({ max: 20000 })
    .withMessage("Prompt too large"),

  body("maxTokens")
    .optional()
    .isInt({ min: 1, max: 4000 })
    .withMessage("maxTokens must be between 1 and 4000")
];
