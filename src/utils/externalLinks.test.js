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
  externalSystemOptions,
  DEFAULT_EXTERNAL_TRACKING,
  SYSTEM_NAME_MAX_LENGTH,
  MAX_EXTERNAL_SYSTEMS
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
    expect(normalizeExternalTracking(undefined)).toEqual({ enabled: false, systems: [] });
    expect(normalizeExternalTracking(null)).toEqual({ enabled: false, systems: [] });
    expect(normalizeExternalTracking('yes')).toEqual({ enabled: false, systems: [] });
    expect(normalizeExternalTracking(7)).toEqual({ enabled: false, systems: [] });
    expect(normalizeExternalTracking([{ name: 'Jira' }])).toEqual({ enabled: false, systems: [] });
    expect(normalizeExternalTracking({ enabled: true, systems: 'Jira' }))
      .toEqual({ enabled: true, systems: [] });
    expect(DEFAULT_EXTERNAL_TRACKING).toEqual({ enabled: false, systems: [] });
  });

  test('well-formed multi-system values are preserved, ids intact (idempotent for the migration)', () => {
    const val = {
      enabled: true,
      systems: [{ id: 'sys-1', name: 'Jira' }, { id: 'sys-2', name: 'SharePoint' }]
    };
    expect(normalizeExternalTracking(val)).toEqual(val);
    expect(normalizeExternalTracking(normalizeExternalTracking(val))).toEqual(val);
  });

  test('legacy single-system shape (issue #284) converts to a one-entry systems list', () => {
    expect(normalizeExternalTracking({ enabled: true, systemName: 'Jira' }))
      .toEqual({ enabled: true, systems: [{ id: 'sys-1', name: 'Jira' }] });
    expect(normalizeExternalTracking({ enabled: false, systemName: 'Jira' }).systems)
      .toEqual([{ id: 'sys-1', name: 'Jira' }]);
  });

  test('legacy empty/whitespace/non-string systemName converts to no systems', () => {
    expect(normalizeExternalTracking({ enabled: true, systemName: '' }).systems).toEqual([]);
    expect(normalizeExternalTracking({ enabled: true, systemName: '   ' }).systems).toEqual([]);
    expect(normalizeExternalTracking({ enabled: true, systemName: 9 }).systems).toEqual([]);
  });

  test('enabled coerces strictly to boolean true', () => {
    expect(normalizeExternalTracking({ enabled: 'yes', systems: [] }).enabled).toBe(false);
    expect(normalizeExternalTracking({ enabled: 1 }).enabled).toBe(false);
    expect(normalizeExternalTracking({ enabled: true }).enabled).toBe(true);
  });

  test('hybrid shapes: an explicit systems array always wins over a legacy systemName', () => {
    // Both-fields records only arise from hand-editing; precedence is pinned
    // so a refactor cannot silently flip it. An explicit empty array means
    // "no systems" — the legacy field does not resurrect.
    expect(normalizeExternalTracking({
      enabled: true,
      systems: [{ id: 'sys-1', name: 'Drive' }],
      systemName: 'Legacy'
    }).systems).toEqual([{ id: 'sys-1', name: 'Drive' }]);
    expect(normalizeExternalTracking({ enabled: true, systems: [], systemName: 'Jira' }).systems)
      .toEqual([]);
  });

  test('enabled is authoritative — never recomputed from the systems list', () => {
    // A scrubbed share export is { enabled: true, systems: [] }; restoring it
    // must keep enabled true, not silently flip it off.
    expect(normalizeExternalTracking({ enabled: true, systems: [] }))
      .toEqual({ enabled: true, systems: [] });
    // And a populated list never switches tracking on by itself.
    expect(normalizeExternalTracking({ systems: [{ id: 'sys-1', name: 'Jira' }] }).enabled)
      .toBe(false);
  });

  test('entries with empty, whitespace, or non-string names are dropped', () => {
    const val = {
      enabled: true,
      systems: [
        { id: 'sys-1', name: 'Jira' },
        { id: 'sys-2', name: '   ' },
        { id: 'sys-3', name: 7 },
        { id: 'sys-4' },
        null,
        'ServiceNow',
        { id: 'sys-5', name: 'SharePoint' }
      ]
    };
    expect(normalizeExternalTracking(val).systems)
      .toEqual([{ id: 'sys-1', name: 'Jira' }, { id: 'sys-5', name: 'SharePoint' }]);
  });

  test('names are trimmed and length-capped', () => {
    expect(normalizeExternalTracking({ enabled: true, systems: [{ name: '  ServiceNow  ' }] }).systems[0].name)
      .toBe('ServiceNow');
    const long = 'x'.repeat(SYSTEM_NAME_MAX_LENGTH + 40);
    expect(normalizeExternalTracking({ enabled: true, systems: [{ name: long }] }).systems[0].name)
      .toHaveLength(SYSTEM_NAME_MAX_LENGTH);
  });

  test('the list is capped at MAX_EXTERNAL_SYSTEMS', () => {
    const many = Array.from({ length: MAX_EXTERNAL_SYSTEMS + 5 }, (_, i) => ({ name: `Sys ${i}` }));
    expect(normalizeExternalTracking({ enabled: true, systems: many }).systems)
      .toHaveLength(MAX_EXTERNAL_SYSTEMS);
  });

  test('missing or duplicate ids get generated collision-free; valid ids are preserved', () => {
    const val = {
      enabled: true,
      systems: [
        { name: 'A' },                 // no id -> generated
        { id: 'sys-1', name: 'B' },    // valid, preserved
        { id: 'sys-1', name: 'C' },    // duplicate -> regenerated
        { id: 42, name: 'D' }          // non-string -> generated
      ]
    };
    const systems = normalizeExternalTracking(val).systems;
    expect(systems.map((s) => s.name)).toEqual(['A', 'B', 'C', 'D']);
    expect(systems.find((s) => s.name === 'B').id).toBe('sys-1');
    const ids = systems.map((s) => s.id);
    expect(new Set(ids).size).toBe(4);
    ids.forEach((id) => expect(typeof id).toBe('string'));
    ids.forEach((id) => expect(id.length).toBeGreaterThan(0));
  });
});

describe('externalSystemOptions', () => {
  test('returns the systems only when tracking is enabled', () => {
    const systems = [{ id: 'sys-1', name: 'Jira' }];
    expect(externalSystemOptions({ enabled: true, systems })).toEqual(systems);
    expect(externalSystemOptions({ enabled: false, systems })).toEqual([]);
    expect(externalSystemOptions(undefined)).toEqual([]);
  });
});

describe('externalUrlLabel', () => {
  test('a single configured system labels implicitly (pre-#288 behavior)', () => {
    expect(externalUrlLabel({ enabled: true, systems: [{ id: 'sys-1', name: 'Jira' }] }, 'ticket'))
      .toBe('Jira ticket URL');
    expect(externalUrlLabel({ enabled: true, systemName: 'ServiceNow' }, 'control'))
      .toBe('ServiceNow control URL');
  });

  test('with several systems the systemId selects the label', () => {
    const tracking = {
      enabled: true,
      systems: [{ id: 'sys-1', name: 'Jira' }, { id: 'sys-2', name: 'SharePoint' }]
    };
    expect(externalUrlLabel(tracking, 'ticket', 'sys-2')).toBe('SharePoint ticket URL');
    expect(externalUrlLabel(tracking, 'ticket', 'sys-1')).toBe('Jira ticket URL');
  });

  test('with several systems and no/unknown selection the label stays generic', () => {
    const tracking = {
      enabled: true,
      systems: [{ id: 'sys-1', name: 'Jira' }, { id: 'sys-2', name: 'SharePoint' }]
    };
    expect(externalUrlLabel(tracking, 'ticket')).toBe('External ticket URL');
    // A dangling reference (e.g. imported finding pointing at a system this
    // assessment does not have) degrades to the generic label, never throws.
    expect(externalUrlLabel(tracking, 'ticket', 'sys-99')).toBe('External ticket URL');
  });

  test('an explicit-but-dangling systemId goes generic even with a single configured system', () => {
    // A confidently wrong system name would be worse than no name; the
    // implicit rule is reserved for records with NO explicit selection.
    const tracking = { enabled: true, systems: [{ id: 'sys-1', name: 'Jira' }] };
    expect(externalUrlLabel(tracking, 'ticket', 'sys-99')).toBe('External ticket URL');
    expect(externalUrlLabel(tracking, 'ticket', '')).toBe('Jira ticket URL');
    expect(externalUrlLabel(tracking, 'ticket', undefined)).toBe('Jira ticket URL');
  });

  test('falls back to a generic label when disabled, unnamed, or unconfigured', () => {
    expect(externalUrlLabel({ enabled: false, systems: [{ id: 'sys-1', name: 'Jira' }] }, 'ticket'))
      .toBe('External ticket URL');
    expect(externalUrlLabel({ enabled: true, systems: [] }, 'ticket')).toBe('External ticket URL');
    expect(externalUrlLabel(undefined, 'ticket')).toBe('External ticket URL');
    // The single-system implicit rule never fires while disabled
    expect(externalUrlLabel({ enabled: false, systemName: 'Jira' }, 'ticket', 'sys-1'))
      .toBe('External ticket URL');
  });
});
