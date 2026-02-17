/**
 * Environment Variable Validation
 * Validates optional environment variables for Jira/Confluence integration.
 *
 * Note: These are now OPTIONAL since credentials can be configured via
 * the Settings UI (stored in localStorage). Environment variables take
 * precedence if set.
 */

const OPTIONAL_ENV_VARS = [
  'REACT_APP_JIRA_INSTANCE_URL',
  'REACT_APP_JIRA_API_TOKEN',
  'REACT_APP_CONFLUENCE_INSTANCE_URL',
  'REACT_APP_CONFLUENCE_API_TOKEN'
];

/**
 * Validates which environment variables are set
 * @returns {Object} { isValid: boolean, missing: string[], configured: string[] }
 */
export const validateEnvironmentVariables = () => {
  const missing = OPTIONAL_ENV_VARS.filter(
    varName => !process.env[varName] || process.env[varName].trim() === ''
  );
  const configured = OPTIONAL_ENV_VARS.filter(
    varName => process.env[varName] && process.env[varName].trim() !== ''
  );

  return {
    isValid: true, // Always valid - env vars are optional
    missing,
    configured
  };
};

/**
 * Generates an info message about environment variable status
 * @param {string[]} missingVars - Array of missing variable names
 * @returns {string} Formatted info message
 */
export const generateErrorMessage = (missingVars) => {
  if (missingVars.length === 0) return '';

  return `Atlassian API credentials not configured via environment variables. Configure them in Settings > Atlassian API Configuration.`;
};

/**
 * Checks environment variables and logs status (non-blocking)
 * Call this at app startup to check configuration status.
 *
 * Note: This is now non-blocking. Atlassian credentials can be configured
 * either via environment variables OR via the Settings UI.
 */
export const checkEnvironmentVariables = () => {
  const { missing, configured } = validateEnvironmentVariables();

  if (configured.length > 0) {
    console.log('✅ Environment variables configured:', configured.join(', '));
  }

  if (missing.length > 0) {
    console.log('ℹ️ Atlassian API credentials not set via environment variables.');
    console.log('   Configure them in Settings > Atlassian API Configuration');
  }
};
