import { body } from "express-validator";

export const atlassianConfigValidation = [
    body("service")
        .isIn(["jira", "confluence"])
        .withMessage("Service must be 'jira' or 'confluence'"),

    body("baseUrl")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("baseUrl is required")
        .isLength({ max: 2048 })
        .withMessage("URL too long")
        .isURL({ require_protocol: true })
        .withMessage("Invalid URL format")
        .custom((value) => {
            if (!value.startsWith("https://")) {
                throw new Error("Only HTTPS URLs are allowed");
            }
            return true;
        }),

    body("email")
        .isString()
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .isLength({ max: 254 })
        .withMessage("Email too long"),

    body("apiToken")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("API token is required")
        .isLength({ min: 10, max: 200 })
        .withMessage("API token length invalid"),
];