/**
 * External ticketing/document link helpers (issue #284).
 * The sanitizer is a security boundary: user-pasted strings become anchor
 * hrefs, and a javascript: href executes on click. Everything that is not an
 * absolute http/https URL must come back null.
 */
import {
  sanitizeExternalUrl,
  normalizeExternalTracking,
  normalizeExternalLinks,
  externalUrlLabel,
  DEFAULT_EXTERNAL_TRACKING,
  SYSTEM_NAME_MAX_LENGTH,
  EXTERNAL_URL_MAX_LENGTH,
  MAX_EXTERNAL_LINKS
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

describe('normalizeExternalTracking (per-type shape, issue #288)', () => {
  const V12 = { enabled: true, systems: { findings: 'Jira', artifacts: 'SharePoint', controls: 'Hyperproof' } };

  test('missing or foreign shapes collapse to the disabled default', () => {
    expect(normalizeExternalTracking(undefined)).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking(null)).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking('yes')).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking(7)).toEqual(DEFAULT_EXTERNAL_TRACKING);
    expect(normalizeExternalTracking({ enabled: false, systems: 'nope' })).toEqual(DEFAULT_EXTERNAL_TRACKING);
  });

  test('well-formed per-type values are preserved (idempotent)', () => {
    expect(normalizeExternalTracking(V12)).toEqual(V12);
    expect(normalizeExternalTracking(normalizeExternalTracking(V12))).toEqual(V12);
  });

  test('v11 single systemName converts to all three record types', () => {
    expect(normalizeExternalTracking({ enabled: true, systemName: 'Jira' })).toEqual({
      enabled: true,
      systems: { findings: 'Jira', artifacts: 'Jira', controls: 'Jira' }
    });
    expect(normalizeExternalTracking({ enabled: true, systemName: '   ' }).systems)
      .toEqual({ findings: '', artifacts: '', controls: '' });
  });

  test('the interim array shape converts via its first named system', () => {
    const interim = { enabled: true, systems: [{ id: 's1', name: '  ' }, { id: 's2', name: 'Jira' }] };
    expect(normalizeExternalTracking(interim).systems)
      .toEqual({ findings: 'Jira', artifacts: 'Jira', controls: 'Jira' });
    expect(normalizeExternalTracking({ enabled: true, systems: [] }).systems)
      .toEqual({ findings: '', artifacts: '', controls: '' });
  });

  test('an explicit systems object wins over a stray legacy systemName', () => {
    const hybrid = {
      enabled: true,
      systems: { findings: 'Jira', artifacts: '', controls: '' },
      systemName: 'LegacyName'
    };
    expect(normalizeExternalTracking(hybrid).systems)
      .toEqual({ findings: 'Jira', artifacts: '', controls: '' });
  });

  test('enabled coerces strictly to boolean true', () => {
    expect(normalizeExternalTracking({ enabled: 'yes', systemName: 'X' }).enabled).toBe(false);
    expect(normalizeExternalTracking({ enabled: 1 }).enabled).toBe(false);
    expect(normalizeExternalTracking({ enabled: true }).enabled).toBe(true);
  });

  test('names are trimmed and length-capped per type', () => {
    const long = 'x'.repeat(SYSTEM_NAME_MAX_LENGTH + 40);
    const result = normalizeExternalTracking({
      enabled: true,
      systems: { findings: '  ServiceNow  ', artifacts: long, controls: 9 }
    });
    expect(result.systems.findings).toBe('ServiceNow');
    expect(result.systems.artifacts).toHaveLength(SYSTEM_NAME_MAX_LENGTH);
    expect(result.systems.controls).toBe('');
  });
});

describe('externalUrlLabel (per-type, issue #288)', () => {
  const tracking = { enabled: true, systems: { findings: 'Jira', artifacts: 'SharePoint', controls: 'Hyperproof' } };

  test('uses the per-type system name when tracking is enabled', () => {
    expect(externalUrlLabel(tracking, 'findings', 'ticket')).toBe('Jira ticket URL');
    expect(externalUrlLabel(tracking, 'controls', 'control')).toBe('Hyperproof control URL');
    expect(externalUrlLabel(tracking, 'artifacts', 'document')).toBe('SharePoint document URL');
  });

  test('a v11 shape still labels through the conversion', () => {
    expect(externalUrlLabel({ enabled: true, systemName: 'Jira' }, 'findings', 'ticket'))
      .toBe('Jira ticket URL');
  });

  test('falls back to generic when disabled, unnamed, unknown type, or unconfigured', () => {
    expect(externalUrlLabel({ ...tracking, enabled: false }, 'findings', 'ticket')).toBe('External ticket URL');
    expect(externalUrlLabel({ enabled: true, systems: { findings: '', artifacts: 'SP', controls: '' } }, 'findings', 'ticket'))
      .toBe('External ticket URL');
    expect(externalUrlLabel(tracking, 'bogus', 'ticket')).toBe('External ticket URL');
    expect(externalUrlLabel(undefined, 'findings', 'ticket')).toBe('External ticket URL');
  });
});

describe('normalizeExternalLinks (issue #288)', () => {
  test('non-arrays come back empty', () => {
    expect(normalizeExternalLinks(undefined)).toEqual([]);
    expect(normalizeExternalLinks(null)).toEqual([]);
    expect(normalizeExternalLinks('links')).toEqual([]);
    expect(normalizeExternalLinks({ type: 'findings', url: 'https://x.example' })).toEqual([]);
  });

  test('drops entries with unknown types or empty/non-string urls', () => {
    const result = normalizeExternalLinks([
      { type: 'findings', url: 'https://jira.example/browse/SEC-1' },
      { type: 'bogus', url: 'https://x.example' },
      { type: 'artifacts', url: '   ' },
      { type: 'controls' },
      { type: 'controls', url: 42 },
      null,
      'junk'
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('findings');
  });

  test('trims and length-caps urls', () => {
    const long = `https://x.example/${'a'.repeat(EXTERNAL_URL_MAX_LENGTH)}`;
    const result = normalizeExternalLinks([
      { type: 'findings', url: '  https://jira.example/browse/SEC-2  ' },
      { type: 'artifacts', url: long }
    ]);
    expect(result[0].url).toBe('https://jira.example/browse/SEC-2');
    expect(result[1].url).toHaveLength(EXTERNAL_URL_MAX_LENGTH);
  });

  test('caps the list at MAX_EXTERNAL_LINKS', () => {
    const many = Array.from({ length: MAX_EXTERNAL_LINKS + 5 }, (_, i) => (
      { type: 'findings', url: `https://jira.example/browse/SEC-${i}` }
    ));
    expect(normalizeExternalLinks(many)).toHaveLength(MAX_EXTERNAL_LINKS);
  });

  test('preserves valid ids, generates missing ones, re-generates duplicates', () => {
    const result = normalizeExternalLinks([
      { id: 'XL-keep', type: 'findings', url: 'https://a.example' },
      { id: 'XL-keep', type: 'findings', url: 'https://b.example' },
      { type: 'controls', url: 'https://c.example' }
    ]);
    expect(result[0].id).toBe('XL-keep');
    expect(result[1].id).not.toBe('XL-keep');
    expect(result[2].id).toBeTruthy();
    expect(new Set(result.map((l) => l.id)).size).toBe(3);
  });

  test('is idempotent — ids stay stable across passes', () => {
    const once = normalizeExternalLinks([
      { type: 'findings', url: 'https://a.example' },
      { type: 'artifacts', url: 'https://b.example' }
    ]);
    expect(normalizeExternalLinks(once)).toEqual(once);
  });

  test('keeps non-http urls as data — render sites neutralize them to plain text', () => {
    // eslint-disable-next-line no-script-url -- attack fixture: normalize keeps it, sanitizeExternalUrl gates render
    const result = normalizeExternalLinks([{ type: 'findings', url: 'javascript:alert(1)' }]);
    expect(result).toHaveLength(1);
    // eslint-disable-next-line no-script-url -- attack fixture assertion
    expect(sanitizeExternalUrl(result[0].url)).toBeNull();
  });
});
