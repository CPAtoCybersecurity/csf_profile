import crypto from 'crypto';

/**
 * Generate a unique error ID for tracking support requests
 * @returns {string} Unique error identifier
 */
export function generateErrorId() {
  return `ERR-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Sanitize error for client response
 * Logs full error details server-side but returns generic message to client
 * @param {Error} error - The error object
 * @param {string} context - Context string for logging
 * @returns {object} Sanitized error response
 */
export function sanitizeErrorResponse(error, context = 'API') {
  const errorId = generateErrorId();

  // Log full error details server-side for debugging
  console.error(`[${errorId}] ${context} error:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });

  // Return sanitized response to client
  return {
    success: false,
    error: 'An error occurred processing your request',
    errorId: errorId
  };
}

/**
 * Get HTTP status code from error
 * @param {Error} error - The error object
 * @returns {number} HTTP status code
 */
export function getErrorStatus(error) {
  // Use error's response status if available, otherwise 500
  return error.response?.status || 500;
}
