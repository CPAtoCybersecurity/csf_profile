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

/** Default per-assessment external-tracking configuration. */
export const DEFAULT_EXTERNAL_TRACKING = Object.freeze({
  enabled: false,
  systemName: ''
});

/**
 * Coerce any persisted/imported value into a well-formed externalTracking
 * object. Foreign shapes (missing, null, wrong types) collapse to the
 * default; systemName is trimmed and length-capped.
 */
export const normalizeExternalTracking = (value) => {
  if (!value || typeof value !== 'object') return { ...DEFAULT_EXTERNAL_TRACKING };
  const systemName = typeof value.systemName === 'string'
    ? value.systemName.trim().slice(0, SYSTEM_NAME_MAX_LENGTH)
    : '';
  return { enabled: value.enabled === true, systemName };
};

/**
 * Label for an external-URL input/link. Uses the assessment's system name
 * when external tracking is enabled ("Jira ticket URL"), a generic label
 * otherwise. `noun` is e.g. "ticket" (findings) or "control" (controls).
 */
export const externalUrlLabel = (externalTracking, noun) => {
  const tracking = normalizeExternalTracking(externalTracking);
  if (tracking.enabled && tracking.systemName) {
    return `${tracking.systemName} ${noun} URL`;
  }
  return `External ${noun} URL`;
};
