import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Use DOMPurify to remove any malicious content
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  });
}

/**
 * Sanitize HTML content (for display that needs some formatting)
 * @param {string} html - The HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== 'string') return html;

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escape special characters for CSV export
 * Prevents CSV injection attacks by prefixing formula characters
 * @param {string} value - The value to escape
 * @returns {string} - Escaped value safe for CSV export
 */
export function escapeCSVValue(value) {
  if (value === null || value === undefined) return '';
  let stringValue = String(value);

  // SECURITY: Prevent CSV injection by prefixing formula-triggering characters
  // Characters =, +, -, @ can execute formulas in Excel/LibreOffice
  if (/^[=+\-@\t\r]/.test(stringValue)) {
    stringValue = "'" + stringValue;
  }

  // If the value contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes("'")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * CSV formula guard for values that are handed to `Papa.unparse`.
 *
 * `escapeCSVValue` above does two jobs: it prefixes formula-triggering
 * characters AND it wraps-and-quotes. The second job is Papa's, and doing it
 * twice is lossy: Papa sees the already-quoted string, quotes it again, and the
 * value comes back from a re-import carrying literal `"` characters — which
 * grow by two on every export → import cycle. An apostrophe alone triggers it,
 * so `Sam's quarterly review` is enough.
 *
 * This helper does the half that is genuinely ours — the injection guard — and
 * leaves quoting to Papa, which gets it right. Use it at every `Papa.unparse`
 * call site. `escapeCSVValue` stays for hand-rolled CSV assembly, where the
 * wrapping IS needed and nothing else quotes.
 *
 * @param {string} value - The value to guard
 * @returns {string} - Value safe to hand to Papa.unparse
 */
export function csvFormulaGuard(value) {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // =, +, -, @ (and leading tab/CR, which some parsers strip before the check)
  // can execute formulas in Excel/LibreOffice.
  return /^[=+\-@\t\r]/.test(stringValue) ? `'${stringValue}` : stringValue;
}

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - Whether the email is valid
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate score value
 * @param {number} score - The score to validate
 * @returns {boolean} - Whether the score is valid (0-10)
 */
export function isValidScore(score) {
  const num = Number(score);
  return !isNaN(num) && num >= 0 && num <= 10;
}

/**
 * Sanitize and validate CSV import data
 * @param {Array} data - The imported CSV data
 * @returns {Object} - { valid: boolean, data: Array, errors: Array }
 */
export function validateCSVImport(data) {
  const errors = [];
  const validatedData = [];

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 for 1-based index and header row
    const validatedRow = { ...row };

    // Sanitize text fields
    const textFields = ['Observations', 'Action Plan', 'Test Procedure(s)'];
    textFields.forEach(field => {
      if (validatedRow[field]) {
        validatedRow[field] = sanitizeInput(validatedRow[field]);
      }
    });

    // Validate scores
    const scoreFields = ['Actual Score', 'Current State Score', 'Desired Target', 'Desired State Score', 'Minimum Target'];
    scoreFields.forEach(field => {
      if (validatedRow[field] !== undefined && validatedRow[field] !== null && validatedRow[field] !== '') {
        if (!isValidScore(validatedRow[field])) {
          errors.push(`Row ${rowNum}: Invalid score value for ${field}: ${validatedRow[field]}`);
          validatedRow[field] = 0;
        }
      }
    });

    // Validate ID field exists
    if (!validatedRow.ID) {
      errors.push(`Row ${rowNum}: Missing required ID field`);
    }

    validatedData.push(validatedRow);
  });

  return {
    valid: errors.length === 0,
    data: validatedData,
    errors,
  };
}
