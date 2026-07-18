/**
 * Metrics catalogue CSV import — "bring your own KPIs/KRIs".
 *
 * The repository ships this import surface and a fictional sample, never
 * metric content: users load their own catalogue as a separate local CSV
 * file that stays on their machine (localStorage), exactly like private
 * data packs. That keeps licensed material (e.g. CIS-derived metrics an
 * organization is entitled to use internally) out of the MIT tree while the
 * app still gives it a first-class drill-down.
 *
 * CSV schema v1 — header row required, UTF-8, one metric per row:
 *   metric_id,name,type,csf_subcategory_ids,description,formula,unit,target,
 *   direction,frequency,data_source,license,references,notes
 *
 *  - `type` is KPI | KRI | metric (case-insensitive, stored canonical)
 *  - `csf_subcategory_ids` is semicolon-separated (e.g. "ID.AM-01;ID.AM-02")
 *  - unknown columns warn-and-skip (forward compatible)
 *  - `license` drives the share-export hard-block (licenseIsRestricted)
 *
 * Same safety model as packImport.js: validate → preview (no writes) →
 * import with provenance on every record, idempotent per catalogue slug.
 */

import Papa from 'papaparse';

export const METRICS_CSV_FORMAT = 1;

export const REQUIRED_COLUMNS = ['metric_id', 'name', 'type', 'csf_subcategory_ids'];

export const KNOWN_COLUMNS = [
  'metric_id', 'name', 'type', 'csf_subcategory_ids', 'description', 'formula',
  'unit', 'target', 'direction', 'frequency', 'data_source', 'license',
  'references', 'notes'
];

// Map lookups go through canonicalType() below — a plain property read would
// let CSV values like "__proto__" resolve through the prototype chain, bypass
// the invalid-type error, and plant a non-string type in the store.
const CANONICAL_TYPES = { kpi: 'KPI', kri: 'KRI', metric: 'metric' };

const canonicalType = (raw) => {
  const key = String(raw || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(CANONICAL_TYPES, key) ? CANONICAL_TYPES[key] : null;
};

const DIRECTIONS = ['higher_is_better', 'lower_is_better', ''];

const RESTRICTED_TOKENS = ['NC', 'ND', 'PROPRIETARY', 'INTERNAL', 'NONCOMMERCIAL', 'NODERIVATIVES', 'NODERIVS'];
// Spelled-out two-word forms ("Non-Commercial", "No Derivatives") tokenize to
// adjacent pairs — matched as sequences so ordinary words never false-positive.
const RESTRICTED_PAIRS = [['NON', 'COMMERCIAL'], ['NO', 'DERIVATIVES'], ['NO', 'DERIVS']];

/**
 * True when a license string forbids redistribution — NC/ND Creative Commons
 * variants (abbreviated or spelled out), proprietary, or explicitly internal
 * content. Token-based so "CC-BY-NC-ND-4.0", "CC BY-NC 4.0", "Creative
 * Commons Noncommercial", and "No Derivatives" all match without substring
 * false-positives.
 */
export const licenseIsRestricted = (license) => {
  const tokens = String(license || '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
  if (RESTRICTED_TOKENS.some((t) => tokens.includes(t))) return true;
  return RESTRICTED_PAIRS.some(([a, b]) =>
    tokens.some((t, i) => t === a && tokens[i + 1] === b)
  );
};

/** True when ANY record in the catalogue carries a restricted license. */
export const catalogIsRestricted = (records) =>
  (records || []).some((m) => licenseIsRestricted(m.license));

/** Derive the stable catalogue slug (idempotency key) from the file name. */
export const catalogSlugFromFilename = (filename) => {
  const stem = String(filename || '')
    .replace(/\.csfmetrics\.csv$/i, '')
    .replace(/\.metricsfixture\.csv$/i, '')
    .replace(/\.csv$/i, '');
  const slug = stem.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'catalog';
};

/** Parse CSV text. Returns the PapaParse result (header mode). */
export const parseMetricsCSV = (text) =>
  Papa.parse(String(text || ''), { header: true, skipEmptyLines: true });

/**
 * Validate a parsed CSV and normalize rows into metric records.
 * @param {Object} parseResult - result of parseMetricsCSV
 * @returns {{ ok: boolean, errors: string[], warnings: string[], records: Object[] }}
 */
export const validateMetricsCatalog = (parseResult) => {
  const errors = [];
  const warnings = [];
  const records = [];

  const fields = parseResult?.meta?.fields || [];
  const rows = Array.isArray(parseResult?.data) ? parseResult.data : [];

  REQUIRED_COLUMNS.forEach((col) => {
    if (!fields.includes(col)) errors.push(`Missing required column "${col}".`);
  });
  fields.forEach((col) => {
    if (col && !KNOWN_COLUMNS.includes(col)) {
      warnings.push(`Unknown column "${col}" skipped (written for a newer format?).`);
    }
  });
  if (rows.length === 0) errors.push('File contains no metric rows.');
  if (errors.length > 0) return { ok: false, errors, warnings, records };

  const seenIds = new Set();
  rows.forEach((row, i) => {
    const id = String(row.metric_id || '').trim();
    const name = String(row.name || '').trim();
    const type = canonicalType(row.type);
    const subcategoryIds = [...new Set(
      String(row.csf_subcategory_ids || '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
    )];
    const direction = String(row.direction || '').trim();

    if (!id) { errors.push(`Row ${i + 2} has no metric_id.`); return; }
    if (seenIds.has(id)) { errors.push(`Duplicate metric_id "${id}" (row ${i + 2}).`); return; }
    seenIds.add(id);
    if (!name) { errors.push(`"${id}" has no name.`); return; }
    if (!type) {
      errors.push(`"${id}" has invalid type "${row.type}" (expected KPI, KRI, or metric).`);
      return;
    }
    if (subcategoryIds.length === 0) {
      errors.push(`"${id}" has no csf_subcategory_ids.`);
      return;
    }
    if (!DIRECTIONS.includes(direction)) {
      warnings.push(`"${id}" direction "${direction}" is not recognized — stored as-is.`);
    }

    records.push({
      id,
      name,
      type,
      subcategoryIds,
      description: String(row.description || '').trim(),
      formula: String(row.formula || '').trim(),
      unit: String(row.unit || '').trim(),
      target: String(row.target || '').trim(),
      direction,
      frequency: String(row.frequency || '').trim(),
      dataSource: String(row.data_source || '').trim(),
      license: String(row.license || '').trim(),
      references: String(row.references || '').trim(),
      notes: String(row.notes || '').trim()
    });
  });

  return { ok: errors.length === 0, errors, warnings, records };
};

/** Set of subcategory IDs present in the default framework's requirements. */
const knownSubcategoryIds = (stores) => {
  const frameworks = stores.frameworksStore?.getState?.()?.frameworks || [];
  const defaultFramework = frameworks.find((f) => f.isDefault) || frameworks[0] || null;
  const requirements = stores.requirementsStore?.getState?.()?.requirements || [];
  return new Set(
    (defaultFramework
      ? requirements.filter((r) => r.frameworkId === defaultFramework.id)
      : requirements
    ).map((r) => r.subcategoryId).filter(Boolean)
  );
};

/**
 * Dry-run a validated catalogue against the stores — powers the preview
 * dialog. Performs NO writes. Rows with unresolved subcategory IDs still
 * import (the user may run a newer framework than this build's default);
 * the preview DISCLOSES them so nothing silently fails to drill down.
 */
export const previewMetricsImport = (validation, stores, { catalogSlug }) => {
  if (!validation.ok) return { validation };

  const known = knownSubcategoryIds(stores);
  const unresolved = [
    ...new Set(
      validation.records
        .flatMap((m) => m.subcategoryIds)
        .filter((id) => !known.has(id))
    )
  ];
  const countsByType = { KPI: 0, KRI: 0, metric: 0 };
  validation.records.forEach((m) => { countsByType[m.type] += 1; });

  const existing = (stores.metricsStore?.getState?.()?.metrics || [])
    .filter((m) => m.catalogSlug === catalogSlug);

  return {
    validation,
    catalogSlug,
    total: validation.records.length,
    countsByType,
    unresolved,
    willReplace: existing.length > 0,
    existingCount: existing.length,
    restricted: catalogIsRestricted(validation.records),
    licenses: [...new Set(validation.records.map((m) => m.license).filter(Boolean))]
  };
};

/**
 * Apply a validated catalogue to the metrics store. Idempotent on
 * catalogSlug — records owned by the slug are replaced, never duplicated.
 * Every record written carries `source: "csv-import"` provenance.
 */
export const importMetricsCatalog = (validation, stores, { catalogSlug }) => {
  if (!validation.ok) {
    throw new Error(validation.errors.join(' '));
  }
  const state = stores.metricsStore?.getState?.();
  if (typeof state?.replaceCatalog !== 'function') {
    throw new Error('metricsStore is missing replaceCatalog(); import aborted before any data was changed.');
  }

  const importedAt = new Date().toISOString();
  const existing = (state.metrics || []).filter((m) => m.catalogSlug === catalogSlug);
  const records = validation.records.map((m) => ({
    ...m,
    source: 'csv-import',
    catalogSlug,
    importedAt
  }));

  state.replaceCatalog(catalogSlug, records);
  return { imported: records.length, replaced: existing.length > 0 };
};

/** Round-trip a catalogue back out as schema-v1 CSV. */
export const exportMetricsCatalogCSV = (records) =>
  Papa.unparse({
    fields: KNOWN_COLUMNS,
    data: (records || []).map((m) => [
      m.id, m.name, m.type, (m.subcategoryIds || []).join(';'), m.description,
      m.formula, m.unit, m.target, m.direction, m.frequency, m.dataSource,
      m.license, m.references, m.notes
    ])
  });

/** Download a catalogue as a schema-v1 CSV file (same DOM idiom as downloadJSON). */
export const downloadMetricsCatalogCSV = (records, catalogSlug) => {
  const csv = exportMetricsCatalogCSV(records);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${catalogSlug}.csfmetrics.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
