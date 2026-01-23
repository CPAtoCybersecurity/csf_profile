/**
 * Environment Variable Validation
<<<<<<< HEAD
 * Validates that all required environment variables are set on app startup
 */

const REQUIRED_ENV_VARS = [
=======
 * Validates optional environment variables for Jira/Confluence integration.
 *
 * Note: These are now OPTIONAL since credentials can be configured via
 * the Settings UI (stored in localStorage). Environment variables take
 * precedence if set.
 */

const OPTIONAL_ENV_VARS = [
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
  'REACT_APP_JIRA_INSTANCE_URL',
  'REACT_APP_JIRA_API_TOKEN',
  'REACT_APP_CONFLUENCE_INSTANCE_URL',
  'REACT_APP_CONFLUENCE_API_TOKEN'
];

/**
<<<<<<< HEAD
 * Validates that all required environment variables are set
 * @returns {Object} { isValid: boolean, missing: string[] }
 */
export const validateEnvironmentVariables = () => {
  const missing = REQUIRED_ENV_VARS.filter(
    varName => !process.env[varName] || process.env[varName].trim() === ''
  );

  return {
    isValid: missing.length === 0,
    missing
=======
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
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
  };
};

/**
<<<<<<< HEAD
 * Generates a helpful error message for missing environment variables
 * @param {string[]} missingVars - Array of missing variable names
 * @returns {string} Formatted error message
 */
export const generateErrorMessage = (missingVars) => {
  const varList = missingVars.map(v => `  - ${v}`).join('\n');

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CONFIGURATION ERROR: Missing Environment Variables
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The following required environment variables are not set:

${varList}

🔧 To fix this issue:

1. Copy the .env.example file to .env:
   cp .env.example .env

2. Edit the .env file and add your API credentials

3. For JIRA and Confluence API tokens, generate them at:
   https://id.atlassian.com/manage-profile/security/api-tokens

4. Restart the application

📖 For Windows users, see the README for instructions on setting
   environment variables in PowerShell or Command Prompt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
};

/**
 * Checks environment variables and throws an error if validation fails
 * Call this at app startup to ensure all required variables are set
 *
 * The app will fail gracefully with a clear error message if any required
 * environment variables are missing. This ensures proper configuration before
 * the JIRA/Confluence integration features are used.
 */
export const checkEnvironmentVariables = () => {
  const { isValid, missing } = validateEnvironmentVariables();

  if (!isValid) {
    const errorMessage = generateErrorMessage(missing);
    console.error(errorMessage);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✅ Environment variables validated successfully');
=======
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
>>>>>>> e0ad92c (feat: implemented hardened docker infrasture and security report)
};
