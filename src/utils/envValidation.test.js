/**
 * Tests for Environment Variable Validation
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
    it('should return invalid when all variables are missing', () => {
      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(false);
      expect(result.missing).toHaveLength(4);
    });

    it('should return valid when all variables are set', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';
      process.env.REACT_APP_CONFLUENCE_INSTANCE_URL = 'https://test.atlassian.net/wiki';
      process.env.REACT_APP_CONFLUENCE_API_TOKEN = 'test-token-456';

      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });

    it('should return invalid when some variables are missing', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';

      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('REACT_APP_CONFLUENCE_INSTANCE_URL');
      expect(result.missing).toContain('REACT_APP_CONFLUENCE_API_TOKEN');
    });

    it('should treat empty strings as missing', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = '';
      process.env.REACT_APP_JIRA_API_TOKEN = '  ';
      process.env.REACT_APP_CONFLUENCE_INSTANCE_URL = 'https://test.atlassian.net/wiki';
      process.env.REACT_APP_CONFLUENCE_API_TOKEN = 'test-token';

      const result = validateEnvironmentVariables();
      expect(result.isValid).toBe(false);
      expect(result.missing).toContain('REACT_APP_JIRA_INSTANCE_URL');
      expect(result.missing).toContain('REACT_APP_JIRA_API_TOKEN');
    });
  });

  describe('generateErrorMessage', () => {
    it('should generate a helpful error message', () => {
      const missing = ['REACT_APP_JIRA_INSTANCE_URL', 'REACT_APP_JIRA_API_TOKEN'];
      const message = generateErrorMessage(missing);

      expect(message).toContain('REACT_APP_JIRA_INSTANCE_URL');
      expect(message).toContain('REACT_APP_JIRA_API_TOKEN');
      expect(message).toContain('.env.example');
      expect(message).toContain('Windows');
    });
  });

  describe('checkEnvironmentVariables', () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should throw when environment variables are missing', () => {
      expect(() => checkEnvironmentVariables()).toThrow(
        'Missing required environment variables'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should throw when some but not all variables are set', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';

      expect(() => checkEnvironmentVariables()).toThrow(
        'Missing required environment variables'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should not throw when all variables are set', () => {
      process.env.REACT_APP_JIRA_INSTANCE_URL = 'https://test.atlassian.net';
      process.env.REACT_APP_JIRA_API_TOKEN = 'test-token-123';
      process.env.REACT_APP_CONFLUENCE_INSTANCE_URL = 'https://test.atlassian.net/wiki';
      process.env.REACT_APP_CONFLUENCE_API_TOKEN = 'test-token-456';

      expect(() => checkEnvironmentVariables()).not.toThrow();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('validated successfully')
      );
    });
  });
});
