/**
 * External ticketing/document link helpers (issue #284).
 *
 * Users may track findings, artifacts, and controls in their own systems
 * (Jira, ServiceNow, Google Drive, SharePoint, ...) and paste ticket/document
 * URLs into the app. Everything rendered as an anchor href MUST pass through
 * sanitizeExternalUrl — user-pasted strings are untrusted and a javascript:
 * href executes on click.
 */

/**
 * Return a safe absolute http/https URL, or null for anything else
 * (javascript:, data:, vbscript:, protocol-relative //host, relative paths,
 * malformed input). Callers render plain text when this returns null —
 * never an anchor.
 */
export const sanitizeExternalUrl = (url) => {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (e) {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  return parsed.href;
};

/** Max length accepted for a user-entered external system name. */
export const SYSTEM_NAME_MAX_LENGTH = 60;

/** Max number of external tracking systems per assessment (issue #288). */
export const MAX_EXTERNAL_SYSTEMS = 10;

/** Default per-assessment external-tracking configuration. */
export const DEFAULT_EXTERNAL_TRACKING = Object.freeze({
  enabled: false,
  systems: Object.freeze([])
});

/** Max length accepted for a system id (defensive cap on imported data). */
const SYSTEM_ID_MAX_LENGTH = 60;

/**
 * Coerce any persisted/imported value into a well-formed externalTracking
 * object. Since issue #288 the shape is { enabled, systems: [{ id, name }] }
 * supporting multiple tracking systems (e.g. Jira for tickets, SharePoint
 * for documents). The pre-#288 single-system shape ({ enabled, systemName })
 * converts to a one-entry systems list.
 *
 * Guarantees: foreign shapes collapse to the default; names are trimmed and
 * length-capped; empty-name entries are dropped; the list is capped at
 * MAX_EXTERNAL_SYSTEMS; every entry has a unique non-empty string id
 * (existing valid ids are preserved so per-record references survive,
 * missing ones are generated collision-free). Idempotent.
 */
export const normalizeExternalTracking = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { enabled: false, systems: [] };
  }
  const enabled = value.enabled === true;

  let rawSystems = [];
  if (Array.isArray(value.systems)) {
    rawSystems = value.systems;
  } else if (typeof value.systemName === 'string') {
    // Legacy single-system shape (issue #284, schema v11).
    rawSystems = [{ name: value.systemName }];
  }

  const systems = [];
  const usedIds = new Set();
  const entries = rawSystems
    .filter((s) => s && typeof s === 'object' && !Array.isArray(s))
    .map((s) => ({
      id: typeof s.id === 'string' ? s.id.trim().slice(0, SYSTEM_ID_MAX_LENGTH) : '',
      name: typeof s.name === 'string' ? s.name.trim().slice(0, SYSTEM_NAME_MAX_LENGTH) : ''
    }))
    .filter((s) => s.name !== '')
    .slice(0, MAX_EXTERNAL_SYSTEMS);
  // Preserve valid ids first so generated ids can never collide with them.
  entries.forEach((s) => {
    if (s.id && !usedIds.has(s.id)) usedIds.add(s.id);
    else s.id = '';
  });
  let counter = 1;
  entries.forEach((s) => {
    if (!s.id) {
      while (usedIds.has(`sys-${counter}`)) counter += 1;
      s.id = `sys-${counter}`;
      usedIds.add(s.id);
    }
    systems.push({ id: s.id, name: s.name });
  });

  return { enabled, systems };
};

/**
 * The systems available for linking under an assessment's tracking config:
 * empty unless tracking is enabled. Accepts any shape (normalizes first).
 */
export const externalSystemOptions = (externalTracking) => {
  const tracking = normalizeExternalTracking(externalTracking);
  return tracking.enabled ? tracking.systems : [];
};

/**
 * Label for an external-URL input/link. `noun` is e.g. "ticket" (findings)
 * or "control" (controls). With one configured system the label uses it
 * implicitly ("Jira ticket URL" — pre-#288 behavior). With several systems,
 * `systemId` selects which one; no/unknown selection falls back to the
 * generic label.
 */
export const externalUrlLabel = (externalTracking, noun, systemId) => {
  const systems = externalSystemOptions(externalTracking);
  // The single-system implicit rule applies only when the record makes NO
  // explicit selection. An explicit-but-dangling reference (imported data
  // pointing at a system this assessment does not have) goes generic — a
  // confidently wrong system name would be worse than no name.
  const selected = systems.find((s) => s.id === systemId)
    || (!systemId && systems.length === 1 ? systems[0] : null);
  if (selected) {
    return `${selected.name} ${noun} URL`;
  }
  return `External ${noun} URL`;
};
