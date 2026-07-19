/**
 * External ticketing/document link helpers (issues #284, #288).
 *
 * Users may track findings, artifacts, and controls in their own systems
 * (Jira, ServiceNow, Google Drive, SharePoint, Hyperproof, ...) and paste
 * ticket/document URLs into the app. Everything rendered as an anchor href
 * MUST pass through sanitizeExternalUrl — user-pasted strings are untrusted
 * and a javascript: href executes on click.
 *
 * Since #288 an assessment names a SEPARATE system per record type
 * (findings / artifacts / controls), and each evaluation observation can
 * carry a list of typed external links.
 */
import { v4 as uuidv4 } from 'uuid';

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

/**
 * Record types that can live in an external system. These keys index
 * externalTracking.systems and type every external link entry.
 */
export const EXTERNAL_LINK_TYPES = Object.freeze(['findings', 'artifacts', 'controls']);

/** Max length accepted for a user-entered external system name. */
export const SYSTEM_NAME_MAX_LENGTH = 60;

/** Max length kept for a stored external link URL. */
export const EXTERNAL_URL_MAX_LENGTH = 2048;

/** Defensive cap on links per observation (imports could carry anything). */
export const MAX_EXTERNAL_LINKS = 30;

/** Default per-assessment external-tracking configuration. */
export const DEFAULT_EXTERNAL_TRACKING = Object.freeze({
  enabled: false,
  systems: Object.freeze({ findings: '', artifacts: '', controls: '' })
});

const cleanSystemName = (name) => (
  typeof name === 'string' ? name.trim().slice(0, SYSTEM_NAME_MAX_LENGTH) : ''
);

/**
 * Coerce any persisted/imported value into the well-formed per-type shape
 * { enabled, systems: { findings, artifacts, controls } }. Shape-detecting,
 * never version-gated:
 *   - per-type systems object → names cleaned per type
 *   - systems as an ARRAY ([{ id, name }] — an unreleased interim shape) →
 *     first named entry applied to all three types
 *   - v11 (#284) single systemName string → applied to all three types
 *   - anything else → disabled default
 * An explicit systems value always wins over a stray legacy systemName.
 */
export const normalizeExternalTracking = (value) => {
  const systems = { findings: '', artifacts: '', controls: '' };
  if (!value || typeof value !== 'object') return { enabled: false, systems };
  if (value.systems && typeof value.systems === 'object' && !Array.isArray(value.systems)) {
    EXTERNAL_LINK_TYPES.forEach((type) => {
      systems[type] = cleanSystemName(value.systems[type]);
    });
  } else if (Array.isArray(value.systems)) {
    const first = value.systems
      .map((s) => cleanSystemName(s && s.name))
      .find((name) => name !== '');
    if (first) {
      EXTERNAL_LINK_TYPES.forEach((type) => {
        systems[type] = first;
      });
    }
  } else if (typeof value.systemName === 'string') {
    const name = cleanSystemName(value.systemName);
    EXTERNAL_LINK_TYPES.forEach((type) => {
      systems[type] = name;
    });
  }
  return { enabled: value.enabled === true, systems };
};

/**
 * Label for an external-URL input/link. Uses the per-type system name when
 * external tracking is enabled ("Jira ticket URL"), a generic label
 * otherwise. `type` is one of EXTERNAL_LINK_TYPES; `noun` is e.g. "ticket"
 * (findings) or "control" (controls).
 */
export const externalUrlLabel = (externalTracking, type, noun) => {
  const tracking = normalizeExternalTracking(externalTracking);
  const systemName = EXTERNAL_LINK_TYPES.includes(type) ? tracking.systems[type] : '';
  if (tracking.enabled && systemName) {
    return `${systemName} ${noun} URL`;
  }
  return `External ${noun} URL`;
};

const generateLinkId = (seen) => {
  let id = `XL-${uuidv4()}`;
  while (seen.has(id)) id = `XL-${uuidv4()}`;
  return id;
};

/**
 * Coerce any persisted/imported value into a well-formed external-links
 * array: [{ id, type, url }]. Entries with an unknown type or an empty /
 * non-string url are dropped; urls are trimmed and length-capped; valid ids
 * are preserved (duplicates re-generated, collision-free); the list is
 * capped at MAX_EXTERNAL_LINKS. Idempotent. Protocol junk (javascript: etc.)
 * is deliberately KEPT here — render sites gate on sanitizeExternalUrl and
 * show plain text, so imported data is neutralized without being destroyed.
 */
export const normalizeExternalLinks = (value) => {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const links = [];
  for (const entry of value) {
    if (links.length >= MAX_EXTERNAL_LINKS) break;
    if (!entry || typeof entry !== 'object') continue;
    if (!EXTERNAL_LINK_TYPES.includes(entry.type)) continue;
    const url = typeof entry.url === 'string'
      ? entry.url.trim().slice(0, EXTERNAL_URL_MAX_LENGTH)
      : '';
    if (!url) continue;
    let id = typeof entry.id === 'string' && entry.id.trim() !== '' ? entry.id : '';
    if (!id || seen.has(id)) id = generateLinkId(seen);
    seen.add(id);
    links.push({ id, type: entry.type, url });
  }
  return links;
};
