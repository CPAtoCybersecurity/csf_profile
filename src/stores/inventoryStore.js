import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

/**
 * System inventory store — the org's application/system register (issue: PR-A
 * of the inventory feature). One record per system: identification, ownership,
 * data profile, access & identity posture, security posture, resilience
 * (BCDR), and record hygiene. Fields map to NIST CSF 2.0 subcategories — the
 * populated inventory is itself ID.AM evidence.
 *
 * The store seeds EMPTY by design: no demo/default records (the standing
 * new-entity rule — demo content arrives through an explicit import, stamped
 * with provenance at the producer, never as a per-store DEFAULT_* seed).
 *
 * PRIVACY: a populated inventory reads as an attacker's target list (system
 * names + URLs + "MFA: No, secrets outside the vault"). The whole `systems`
 * section is OMITTED from share exports by default and rides only under the
 * explicit include-private opt-in — see shareRegistry.js. Complete backups
 * carry it wholesale, like every section.
 */

// ---------------------------------------------------------------------------
// Picklists — single home for every inventory dropdown (CONTROL_STATUSES
// idiom: exported const, consumed by the page, CSV lanes, and tests alike).
// None of these lists carries an "Other" value on purpose: free-text residue
// belongs in `notes`, not in a picklist that analytics will group by.
// ---------------------------------------------------------------------------
export const DEPLOYMENT_TYPES = ['SaaS', 'On-premise', 'IaaS/PaaS-hosted', 'Hybrid', 'Individual use'];
// Lifecycle only — "under audit" is an orthogonal state carried by the TPRM
// and access-review date fields, never a stage.
export const INVENTORY_STAGES = ['Planned', 'Implementation', 'Live', 'Sunsetting', 'Retired'];
export const DATA_CLASSIFICATIONS = ['Public', 'Internal', 'Confidential', 'Strictly Confidential'];
// Tri-state posture answers. '' (absent from this list) means UNSET — a blank
// answer must never be read, exported, or rolled up as "No".
export const TRI_STATE = ['Yes', 'No', 'N/A'];
export const SECURITY_TIERS = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
export const AUTH_METHODS = ['SAML SSO', 'OIDC SSO', 'Password + MFA', 'Password only'];
export const PROVISIONING_METHODS = ['SCIM', 'IdP just-in-time', 'Manual', 'Self-serve'];
export const DEPROVISIONING_TRIGGERS = ['Automatic via IdP', 'HR feed', 'Manual ticket', 'None'];
export const ACCESS_REVIEW_CADENCES = ['Quarterly', 'Semi-annual', 'Annual', 'None'];
export const EXPOSURE_LEVELS = ['Public internet', 'VPN / private network', 'Internal only'];
export const PATCHING_RESPONSIBILITIES = ['Vendor-managed', 'Ours', 'Shared'];
export const BCDR_TIERS = ['Tier 0 - Critical', 'Tier 1', 'Tier 2', 'Tier 3 - Deferrable'];
export const DISCOVERY_SOURCES = ['Intake request', 'SSO logs', 'Expense report', 'Network scan', 'Word of mouth'];
export const DATA_RESIDENCIES = ['Canada', 'United States', 'EU', 'Global / multi-region', 'Unknown'];
export const REGULATED_DATA_TYPES = ['PHI', 'PCI', 'Financial', 'Intellectual property'];
export const TPRM_ARTIFACTS = ['SOC 2 report', 'Penetration test', 'DPA', 'Security addendum'];
export const COMPLIANCE_SCOPES = ['SOC 2', 'PCI DSS', 'HIPAA', 'ISO 27001'];

export const MAX_EVIDENCE_LINKS = 30;

// ---------------------------------------------------------------------------
// Record shape. Every creatable field with its unset default. `id`,
// `createdDate`, `lastModified`, and `source` are stamped by the store, never
// by callers.
// ---------------------------------------------------------------------------
export const SYSTEM_FIELD_DEFAULTS = Object.freeze({
  // A. Identification
  name: '',
  description: '',
  vendor: '',
  deploymentType: '',
  applicationUrl: '', // render-gated by sanitizeExternalUrl, never an unchecked anchor
  stage: '',
  vendorEolDate: '',
  // B. Ownership & contacts — opaque userStore ids, no inline PII (#290)
  businessOwnerId: '',
  technologyOwnerId: '',
  primaryContactId: '',
  vendorContact: '', // external person, free text — the one inline-PII field
  // C. Data profile
  dataClassification: '',
  pii: '',
  regulatedDataTypes: [],
  dataResidency: '',
  complianceScope: [],
  // D. Access & identity
  ssoMfa: '',
  authMethod: '',
  localAccounts: '',
  adminCount: '',
  secretsInVault: '',
  provisioningMethod: '',
  deprovisioningTrigger: '',
  accessReviewCadence: '',
  lastAccessReviewDate: '',
  // E. Security posture
  securityTier: '',
  internetExposure: '',
  siemLogging: '',
  customCode: '',
  segregatedEnvironments: '',
  patchingResponsibility: '',
  tprmDueDiligenceDate: '',
  tprmArtifacts: [],
  contractRenewalDate: '',
  aiFeatures: '',
  // F. Resilience (BCDR)
  bcdrTier: '',
  rtoHours: '',
  rpoHours: '',
  mtoHours: '',
  backupsInPlace: '',
  backupsLastTestedDate: '',
  // G. Record hygiene
  discoverySource: '',
  onboardedDate: '',
  retiredDate: '',
  lastReviewedDate: '',
  attestedById: '',
  evidenceLinks: [],
  notes: ''
});

const ARRAY_FIELDS = ['regulatedDataTypes', 'complianceScope', 'tprmArtifacts', 'evidenceLinks'];
const NUMERIC_FIELDS = ['adminCount', 'rtoHours', 'rpoHours', 'mtoHours'];

/**
 * Field sensitivity classes for the selective export lanes (CSV / Notion /
 * markdown, PR-B). The share export does not consult this map — the whole
 * section is mode-gated there (shareRegistry.js) — but the classification is
 * schema-owned so every lane draws the same line. `open` fields describe THAT
 * a system exists and who runs it; `sensitive` fields describe how to attack
 * it (URLs, auth posture, exposure, recovery capacity) or someone's identity.
 * The completeness test pins: every field classified, no field in both.
 */
export const INVENTORY_FIELD_CLASSES = Object.freeze({
  open: Object.freeze([
    'id', 'name', 'description', 'vendor', 'deploymentType', 'stage',
    'vendorEolDate', 'businessOwnerId', 'technologyOwnerId', 'primaryContactId',
    'securityTier', 'bcdrTier', 'complianceScope', 'dataResidency',
    'discoverySource', 'onboardedDate', 'retiredDate', 'lastReviewedDate',
    'attestedById', 'source', 'createdDate', 'lastModified'
  ]),
  sensitive: Object.freeze([
    'applicationUrl', 'vendorContact', 'dataClassification', 'pii',
    'regulatedDataTypes', 'ssoMfa', 'authMethod', 'localAccounts',
    'adminCount', 'secretsInVault', 'provisioningMethod',
    'deprovisioningTrigger', 'accessReviewCadence', 'lastAccessReviewDate',
    'internetExposure', 'siemLogging', 'customCode', 'segregatedEnvironments',
    'patchingResponsibility', 'tprmDueDiligenceDate', 'tprmArtifacts',
    'contractRenewalDate', 'aiFeatures', 'rtoHours', 'rpoHours', 'mtoHours',
    'backupsInPlace', 'backupsLastTestedDate', 'evidenceLinks', 'notes'
  ])
});

/**
 * Next stable system id: SYS-001, SYS-002, … Max-plus-one over every id that
 * matches the pattern, so deleting SYS-001 never recycles its id for a new
 * (different) system — inventory ids are referenced from evidence and audits.
 */
export const nextSystemId = (systems) => {
  const max = (systems || []).reduce((acc, s) => {
    const m = /^SYS-(\d+)$/.exec(s?.id || '');
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  return `SYS-${String(max + 1).padStart(3, '0')}`;
};

const normalizeString = (value) => (typeof value === 'string' ? value : '');

const normalizeNumeric = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return '';
};

const normalizeStringArray = (value) =>
  Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [];

/** Evidence links: [{ id, label, url }] — junk collapses, cap enforced. */
export const normalizeEvidenceLinks = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object' && !Array.isArray(item))
    .slice(0, MAX_EVIDENCE_LINKS)
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : uuidv4(),
      label: normalizeString(item.label),
      url: normalizeString(item.url)
    }));
};

/**
 * Shape-normalize one system record. SHAPE, not vocabulary: wrong-typed
 * values collapse to unset, but unknown picklist strings are preserved —
 * a foreign file's custom stage renders as-is rather than being silently
 * discarded. Absent fields get their unset default. Blank tri-states stay
 * blank (unset is not "No"). Idempotent.
 */
export const normalizeSystemRecord = (record) => {
  if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
  const out = { ...SYSTEM_FIELD_DEFAULTS, ...record };
  Object.keys(SYSTEM_FIELD_DEFAULTS).forEach((field) => {
    if (ARRAY_FIELDS.includes(field)) return;
    if (NUMERIC_FIELDS.includes(field)) {
      out[field] = normalizeNumeric(out[field]);
      return;
    }
    out[field] = normalizeString(out[field]);
  });
  out.regulatedDataTypes = normalizeStringArray(out.regulatedDataTypes);
  out.complianceScope = normalizeStringArray(out.complianceScope);
  out.tprmArtifacts = normalizeStringArray(out.tprmArtifacts);
  out.evidenceLinks = normalizeEvidenceLinks(out.evidenceLinks);
  out.source = typeof record.source === 'string' && record.source ? record.source : 'manual';
  out.createdDate = normalizeString(record.createdDate);
  out.lastModified = normalizeString(record.lastModified);
  return out;
};

/**
 * Restore-path heal (dataImport.js runs this UNCONDITIONALLY): junk records
 * drop, every kept record is shape-normalized, and records missing an id are
 * stamped with a fresh collision-free one (render keys and cross-references
 * need it). Absent-only and idempotent — a current-format file passes
 * through unchanged.
 */
export const normalizeSystemFields = (state) => {
  const source = Array.isArray(state?.systems) ? state.systems : [];
  const kept = source.map((record) => normalizeSystemRecord(record)).filter(Boolean);
  const seen = new Set();
  let max = kept.reduce((acc, r) => {
    const m = /^SYS-(\d+)$/.exec(typeof r.id === 'string' ? r.id : '');
    return m ? Math.max(acc, parseInt(m[1], 10)) : acc;
  }, 0);
  const systems = kept.map((record) => {
    // Missing, malformed, AND duplicate ids all re-stamp — two records may
    // never share an id (render keys and audit references depend on it).
    const valid =
      typeof record.id === 'string' && /^SYS-\d+$/.test(record.id) && !seen.has(record.id);
    let id = record.id;
    if (!valid) {
      max += 1;
      id = `SYS-${String(max).padStart(3, '0')}`;
    }
    seen.add(id);
    return { ...record, id };
  });
  return { ...state, systems };
};

const useInventoryStore = create(
  persist(
    (set, get) => ({
      systems: [],

      /** Full replace — restore (dataImport.js) uses this. */
      setSystems: (systems) => set({ systems: Array.isArray(systems) ? systems : [] }),

      /**
       * Create a system record. Store stamps id / source / createdDate /
       * lastModified; caller fields are shape-normalized through the same
       * pass the restore path uses (one producer, one shape).
       */
      addSystem: (fields) => {
        const now = new Date().toISOString();
        const normalized = normalizeSystemRecord(fields || {}) || { ...SYSTEM_FIELD_DEFAULTS };
        const record = {
          ...normalized,
          id: nextSystemId(get().systems),
          source: 'manual',
          createdDate: now,
          lastModified: now
        };
        set((state) => ({ systems: [...state.systems, record] }));
        return record;
      },

      /**
       * Update a system. `id`, `source`, and `createdDate` are immutable —
       * updates carrying them are ignored for those keys. Stamps lastModified.
       */
      updateSystem: (id, updates) => {
        set((state) => ({
          systems: state.systems.map((s) => {
            if (s.id !== id) return s;
            const merged = normalizeSystemRecord({ ...s, ...updates }) || s;
            return {
              ...merged,
              id: s.id,
              source: s.source,
              createdDate: s.createdDate,
              lastModified: new Date().toISOString()
            };
          })
        }));
      },

      deleteSystem: (id) =>
        set((state) => ({ systems: state.systems.filter((s) => s.id !== id) })),

      getSystem: (id) => get().systems.find((s) => s.id === id)
    }),
    {
      name: 'csf-inventory-storage',
      version: 1,
      partialize: (state) => ({ systems: state.systems })
    }
  )
);

export default useInventoryStore;
