/**
 * External ticketing/document link helpers (issue #284).
 * The sanitizer is a security boundary: user-pasted strings become anchor
 * hrefs, and a javascript: href executes on click. Everything that is not an
 * absolute http/https URL must come back null.
 */
import {
  sanitizeExternalUrl,
  normalizeExternalTracking,
  externalUrlLabel,
  DEFAULT_EXTERNAL_TRACKING,
  SYSTEM_NAME_MAX_LENGTH
} from './externalLinks';

describe('sanitizeExternalUrl', () => {
  test('accepts absolute http and https URLs', () => {
    expect(sanitizeExternalUrl('https://jira.example.com/browse/SEC-123'))
      .toBe('https://jira.example.com/browse/SEC-123');
    expect(sanitizeExternalUrl('http://tracker.local/ticket/9'))
      .toBe('http://tracker.local/ticket/9');
  });

  test('trims surrounding whitespace and normalizes via the URL parser', () => {
    expect(sanitizeExternalUrl('  https://drive.google.com/file/d/abc  '))
      .toBe('https://drive.google.com/file/d/abc');
    // Bare origins normalize with a trailing slash — still a safe https href
    expect(sanitizeExternalUrl('https://sharepoint.example.com'))
      .toBe('https://sharepoint.example.com/');
  });

  test('rejects javascript:, data:, and vbscript: schemes', () => {
    // eslint-disable-next-line no-script-url -- attack fixture: the sanitizer must reject it
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBeNull();
    // eslint-disable-next-line no-script-url -- attack fixture: case-insensitive scheme
    expect(sanitizeExternalUrl('JAVASCRIPT:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeExternalUrl('vbscript:msgbox(1)')).toBeNull();
  });

  test('rejects whitespace-obfuscated schemes (URL parser strips tabs/newlines)', () => {
    expect(sanitizeExternalUrl('java\nscript:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl('java\tscript:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl(' javascript:alert(1) ')).toBeNull();
  });

  test('rejects leading-control-char obfuscation (browsers strip C0 chars before scheme parsing)', () => {
    expect(sanitizeExternalUrl('\u0001javascript:alert(1)')).toBeNull();
    expect(sanitizeExternalUrl('\u0000javascript:alert(1)')).toBeNull();
  });

  test('rejects protocol-relative, relative, and malformed input', () => {
    expect(sanitizeExternalUrl('//evil.example.com/x')).toBeNull();
    expect(sanitizeExternalUrl('tickets/SEC-123')).toBeNull();
    expect(sanitizeExternalUrl('ftp://files.example.com/a')).toBeNull();
    expect(sanitizeExternalUrl('not a url')).toBeNull();
  });

  test('rejects non-strings and empty values', () => {
    expect(sanitizeExternalUrl(null)).toBeNull();
    expect(sanitizeExternalUrl(undefined)).toBeNull();
    expect(sanitizeExternalUrl(42)).toBeNull();
    expect(sanitizeExternalUrl('')).toBeNull();
    expect(sanitizeExternalUrl('   ')).toBeNull();
  });
});

describe('normalizeExternalTracking', () => {
  test('missing or foreign shapes collapse to the disabled default', () => {
    expect(normalizeExternalTracking(undefined)).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking(null)).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking('yes')).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking(7)).toEqual(DEFAULT_EXTERNAL_TRACKING);
  });

  test('well-formed values are preserved (idempotent for the migration)', () => {
    const val = { enabled: true, systemName: 'Jira' };
    expect(normalizeExternalTracking(val)).toEqual(val);
    expect(normalizeExternalTracking(normalizeExternalTracking(val))).toEqual(val);
  });

  test('enabled coerces strictly to boolean true', () => {
    expect(normalizeExternalTracking({ enabled: 'yes', systemName: 'X' }).enabled).toBe(false);
    expect(normalizeExternalTracking({ enabled: 1 }).enabled).toBe(false);
    expect(normalizeExternalTracking({ enabled: true }).enabled).toBe(true);
  });

  test('systemName is trimmed and length-capped', () => {
    expect(normalizeExternalTracking({ enabled: true, systemName: '  ServiceNow  ' }).systemName)
      .toBe('ServiceNow');
    const long = 'x'.repeat(SYSTEM_NAME_MAX_LENGTH + 40);
    expect(normalizeExternalTracking({ enabled: true, systemName: long }).systemName)
      .toHaveLength(SYSTEM_NAME_MAX_LENGTH);
    expect(normalizeExternalTracking({ enabled: true, systemName: 9 }).systemName).toBe('');
  });
});

describe('externalUrlLabel', () => {
  test('uses the system name when tracking is enabled', () => {
    expect(externalUrlLabel({ enabled: true, systemName: 'Jira' }, 'ticket')).toBe('Jira ticket URL');
    expect(externalUrlLabel({ enabled: true, systemName: 'ServiceNow' }, 'control')).toBe('ServiceNow control URL');
  });

  test('falls back to a generic label when disabled, unnamed, or unconfigured', () => {
    expect(externalUrlLabel({ enabled: false, systemName: 'Jira' }, 'ticket')).toBe('External ticket URL');
    expect(externalUrlLabel({ enabled: true, systemName: '' }, 'ticket')).toBe('External ticket URL');
    expect(externalUrlLabel(undefined, 'ticket')).toBe('External ticket URL');
  });
});
