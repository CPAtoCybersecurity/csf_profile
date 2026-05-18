import { body } from "express-validator";
import dns from "dns/promises";
import net from "net";

function isPrivateIP(ip) {
    if (net.isIPv4(ip)) {
        const parts = ip.split(".").map(Number);

        return (
            parts[0] === 10 ||
            parts[0] === 127 ||
            (parts[0] === 192 && parts[1] === 168) ||
            (parts[0] === 169 && parts[1] === 254) ||
            (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
        );
    }

    if (net.isIPv6(ip)) {
        return ip === "::1" || ip.startsWith("fe80") || ip.startsWith("fc") || ip.startsWith("fd");
    }

    return false;
}

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
        .customSanitizer(value => value.replace(/\/+$/, ""))
        .custom(async (value) => {
            if (!value.startsWith("https://")) {
                throw new Error("Only HTTPS URLs are allowed");
            }

            const url = new URL(value);

            // Prevent credential exfiltration
            const hostname = url.hostname.toLowerCase();

            if (
                hostname !== "atlassian.net" &&
                !hostname.endsWith(".atlassian.net")
            ) {
                throw new Error("Only Atlassian cloud domains are allowed");
            }

            // Prevent SSRF to internal IPs
            const addresses = await dns.lookup(url.hostname, { all: true });

            for (const addr of addresses) {
                if (isPrivateIP(addr.address)) {
                    throw new Error("Internal/private IPs are not allowed");
                }
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
