/**
 * Tests for Environment Variable Validation
 *
 * Atlassian credentials are OPTIONAL: they can come from environment
 * variables or from the Settings UI (localStorage). Validation reports
 * what is configured vs missing but never fails or throws.
 */

import {
  validateEnvironmentVariables,
  generateErrorMessage,
  checkEnvironmentVariables
} from './envValidation';

describe('envValidation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_JIRA_INSTANCE_URL;
    delete process.env.REACT_APP_JIRA_API_TOKEN;
    delete process.env.REACT_APP_CONFLUENCE_INSTANCE_URL;
    delete process.env.REACT_APP_CONFLUENCE_API_TOKEN;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironmentVariables', () => {
    it('reports all variables missing but stays valid (env vars are optional)', () => {
      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(4);
      expect(result.configured).toHaveLength(0);
    });

    it('reports valid with nothing missing when all variables are set', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';
      process.env.REACT_APP_CONFLUENCE_INSTANCE_URL = 'https://test.atlassian.net/wiki';
      process.env.REACT_APP_CONFLUENCE_API_TOKEN = 'test-token-456';

      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.configured).toHaveLength(4);
    });

    it('lists unset variables as missing while staying valid', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';

      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(true);
      expect(result.missing).toContain('REACT_APP_CONFLUENCE_INSTANCE_URL');
      expect(result.missing).toContain('REACT_APP_CONFLUENCE_API_TOKEN');
      expect(result.configured).toContain('REACT_APP_JIRA_INSTANCE_URL');
      expect(result.configured).toContain('REACT_APP_JIRA_API_TOKEN');
    });

    it('treats empty strings as missing', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = '';
      process.env.REACT_APP_JIRA_API_TOKEN = '  ';
      process.env.REACT_APP_CONFLUENCE_INSTANCE_URL = 'https://test.atlassian.net/wiki';
      process.env.REACT_APP_CONFLUENCE_API_TOKEN = 'test-token';

      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(true);
      expect(result.missing).toContain('REACT_APP_JIRA_INSTANCE_URL');
      expect(result.missing).toContain('REACT_APP_JIRA_API_TOKEN');
      expect(result.missing).not.toContain('REACT_APP_CONFLUENCE_INSTANCE_URL');
    });
  });

  describe('generateErrorMessage', () => {
    it('points the user at the Settings UI when variables are missing', () => {
      const missing = ['REACT_APP_JIRA_INSTANCE_URL', 'REACT_APP_JIRA_API_TOKEN'];
      const message = generateErrorMessage(missing);

      expect(message).toContain('Settings');
      expect(message).toContain('Atlassian API');
    });

    it('returns an empty string when nothing is missing', () => {
      expect(generateErrorMessage([])).toBe('');
    });
  });

  describe('checkEnvironmentVariables', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('does not throw when environment variables are missing (non-blocking)', () => {
      expect(() => checkEnvironmentVariables()).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('not set via environment variables')
      );
    });

    it('does not throw when some but not all variables are set', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';

      expect(() => checkEnvironmentVariables()).not.toThrow();
    });

    it('logs the configured variables when all are set', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';
      process.env.REACT_APP_CONFLUENCE_INSTANCE_URL = 'https://test.atlassian.net/wiki';
      process.env.REACT_APP_CONFLUENCE_API_TOKEN = 'test-token-456';

      expect(() => checkEnvironmentVariables()).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Environment variables configured'),
        expect.stringContaining('REACT_APP_JIRA_INSTANCE_URL')
      );
    });
  });
});
