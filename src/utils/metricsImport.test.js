/**
 * Tests for the metrics catalogue CSV import (metricsImport.js) and its
 * share-export guards (dataExport.js).
 *
 * Conventions follow packImport.test.js: hand-rolled mock stores with
 * jest.fn() setters, no real zustand. The leak tests deliberately assert on
 * THREE carrier classes, not just record text: definition text, linkage
 * identifiers (metric_id / catalogSlug riding on user-authored quarters), and
 * post-filter aggregate counts.
 */

import fs from 'fs';
import path from 'path';
import {
  parseMetricsCSV,
  validateMetricsCatalog,
  previewMetricsImport,
  importMetricsCatalog,
  exportMetricsCatalogCSV,
  catalogSlugFromFilename,
  licenseIsRestricted,
  catalogIsRestricted,
  KNOWN_COLUMNS
} from './metricsImport';
import { buildShareableExport, exportAllDataJSON } from './dataExport';
import { validateDatabaseExport, importCompleteDatabase } from './dataImport';

const HEADER = KNOWN_COLUMNS.join(',');

const csv = (...rows) => [HEADER, ...rows].join('\n');

const ROW_A = 'CIS-1.1,Networks not actively scanned,metric,ID.AM-01,Networks without recent active discovery scans,,%,Sigma: 69% or Less,lower_is_better,monthly,Discovery tool,CC-BY-NC-ND-4.0,Licensed catalogue INTERNAL USE ONLY,secret-cis-note';
const ROW_B = 'ALMA-1,MFA coverage,KPI,PR.AA-01,Privileged accounts with MFA,,%,100%,higher_is_better,monthly,IdP,,Fictional sample,';

const FRAMEWORKS = [{ id: 'nist-csf-2.0', name: 'NIST CSF 2.0', isDefault: true }];
const REQUIREMENTS = [
  { id: 'r-1', frameworkId: 'nist-csf-2.0', subcategoryId: 'ID.AM-01' },
  { id: 'r-2', frameworkId: 'nist-csf-2.0', subcategoryId: 'PR.AA-01' }
];

const makeMetricsStore = (metrics = []) => {
  let state = { metrics };
  const api = {
    getState: () => ({
      metrics: state.metrics,
      setMetrics: (m) => { state.metrics = m; },
      replaceCatalog: (slug, records) => {
        state.metrics = [...state.metrics.filter((x) => x.catalogSlug !== slug), ...records];
      },
      removeCatalog: (slug) => {
        state.metrics = state.metrics.filter((x) => x.catalogSlug !== slug);
      }
    })
  };
  return api;
};

const makeStores = ({ metrics = [], assessments = [], findings = [] } = {}) => ({
  metricsStore: makeMetricsStore(metrics),
  assessmentsStore: { getState: () => ({ assessments, setAssessments: jest.fn() }) },
  findingsStore: { getState: () => ({ findings, setFindings: jest.fn() }) },
  frameworksStore: { getState: () => ({ frameworks: FRAMEWORKS, setFrameworks: jest.fn() }) },
  requirementsStore: { getState: () => ({ requirements: REQUIREMENTS, setRequirements: jest.fn() }) },
  controlsStore: { getState: () => ({ controls: [], setControls: jest.fn() }) },
  artifactStore: { getState: () => ({ artifacts: [], setArtifacts: jest.fn() }) },
  userStore: { getState: () => ({ users: [], setUsers: jest.fn() }) },
  inventoryStore: { getState: () => ({ systems: [], setSystems: jest.fn() }) },
  orgProfileStore: { getState: () => ({ profile: null, cloudConsent: false, setProfileState: jest.fn() }) }
});

const importCsv = (text, stores, slug = 'test-catalog') => {
  const validation = validateMetricsCatalog(parseMetricsCSV(text));
  expect(validation.ok).toBe(true);
  return importMetricsCatalog(validation, stores, { catalogSlug: slug });
};

afterEach(() => {
  window.localStorage.clear();
});

describe('validateMetricsCatalog', () => {
  test('accepts a valid catalogue and normalizes rows', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(csv(ROW_A, ROW_B)));
    expect(v.ok).toBe(true);
    expect(v.records).toHaveLength(2);
    expect(v.records[0]).toMatchObject({
      id: 'CIS-1.1',
      type: 'metric',
      subcategoryIds: ['ID.AM-01'],
      license: 'CC-BY-NC-ND-4.0'
    });
  });

  test('type is case-insensitive and stored canonical', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(csv(
      'M-1,Name,kpi,ID.AM-01,,,,,,,,,,',
      'M-2,Name,KRI,ID.AM-01,,,,,,,,,,',
      'M-3,Name,Metric,ID.AM-01,,,,,,,,,,'
    )));
    expect(v.ok).toBe(true);
    expect(v.records.map((m) => m.type)).toEqual(['KPI', 'KRI', 'metric']);
  });

  test('rejects invalid type with row identity in the message', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(csv('M-1,Name,gauge,ID.AM-01,,,,,,,,,,')));
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/M-1.*invalid type/);
  });

  test('prototype-chain type values (__proto__, constructor) are rejected, not resolved', () => {
    ['__proto__', 'constructor', 'hasOwnProperty'].forEach((sneaky) => {
      const v = validateMetricsCatalog(parseMetricsCSV(csv(`M-1,Name,${sneaky},ID.AM-01,,,,,,,,,,`)));
      expect(v.ok).toBe(false);
      expect(v.errors.join(' ')).toMatch(/invalid type/);
    });
  });

  test('duplicate subcategory IDs within a row are de-duplicated', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(csv('M-1,Name,KPI,ID.AM-01;ID.AM-01;PR.AA-01,,,,,,,,,,')));
    expect(v.ok).toBe(true);
    expect(v.records[0].subcategoryIds).toEqual(['ID.AM-01', 'PR.AA-01']);
  });

  test('rejects duplicate metric_id, missing name, missing subcategories', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(csv(
      'M-1,Name,KPI,ID.AM-01,,,,,,,,,,',
      'M-1,Other,KPI,ID.AM-01,,,,,,,,,,',
      'M-2,,KPI,ID.AM-01,,,,,,,,,,',
      'M-3,Name,KPI,,,,,,,,,,,'
    )));
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/Duplicate metric_id "M-1"/);
    expect(v.errors.join(' ')).toMatch(/"M-2" has no name/);
    expect(v.errors.join(' ')).toMatch(/"M-3" has no csf_subcategory_ids/);
  });

  test('rejects a file missing a required column', () => {
    const v = validateMetricsCatalog(parseMetricsCSV('metric_id,name\nM-1,Name'));
    expect(v.ok).toBe(false);
    expect(v.errors.join(' ')).toMatch(/required column "type"/);
  });

  test('unknown columns warn and are skipped, not fatal', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(
      `${HEADER},future_column\n${ROW_B},future-value`
    ));
    expect(v.ok).toBe(true);
    expect(v.warnings.join(' ')).toMatch(/Unknown column "future_column"/);
    expect(v.records[0].future_column).toBeUndefined();
  });

  test('splits semicolon-separated subcategory IDs', () => {
    const v = validateMetricsCatalog(parseMetricsCSV(csv('M-1,Name,KPI,ID.AM-01; PR.AA-01,,,,,,,,,,')));
    expect(v.records[0].subcategoryIds).toEqual(['ID.AM-01', 'PR.AA-01']);
  });
});

describe('licenseIsRestricted', () => {
  test.each([
    ['CC-BY-NC-ND-4.0', true],
    ['CC BY-NC 4.0', true],
    ['proprietary', true],
    ['Internal use only', true],
    ['Creative Commons Noncommercial', true],
    ['CC Non-Commercial 4.0', true],
    ['CC BY No Derivatives', true],
    ['CC BY-NoDerivs 3.0', true],
    ['MIT', false],
    ['CC-BY-4.0', false],
    ['CC BY-SA 4.0', false],
    ['', false]
  ])('%s → %s', (license, expected) => {
    expect(licenseIsRestricted(license)).toBe(expected);
  });

  test('token-based: "second brand" style words containing nc/nd do not match', () => {
    expect(licenseIsRestricted('Vendor Standard License')).toBe(false);
  });
});

describe('catalogSlugFromFilename', () => {
  test.each([
    ['cis-v7-mm.csfmetrics.csv', 'cis-v7-mm'],
    ['My Metrics (2026).csv', 'my-metrics-2026'],
    ['alma-security.metricsfixture.csv', 'alma-security'],
    ['', 'catalog']
  ])('%s → %s', (name, expected) => {
    expect(catalogSlugFromFilename(name)).toBe(expected);
  });
});

describe('previewMetricsImport', () => {
  test('reports counts, unresolved IDs, replace verdict — and performs no writes', () => {
    const stores = makeStores({
      metrics: [{ id: 'OLD-1', catalogSlug: 'test-catalog', source: 'csv-import' }]
    });
    const v = validateMetricsCatalog(parseMetricsCSV(csv(
      ROW_A,
      ROW_B,
      'M-3,Unmapped metric,KRI,ZZ.XX-99,,,,,,,,,,'
    )));
    const preview = previewMetricsImport(v, stores, { catalogSlug: 'test-catalog' });

    expect(preview.total).toBe(3);
    expect(preview.countsByType).toEqual({ KPI: 1, KRI: 1, metric: 1 });
    expect(preview.unresolved).toEqual(['ZZ.XX-99']);
    expect(preview.willReplace).toBe(true);
    expect(preview.existingCount).toBe(1);
    expect(preview.restricted).toBe(true);
    // no writes: store still has only the old record
    expect(stores.metricsStore.getState().metrics).toHaveLength(1);
  });
});

describe('importMetricsCatalog', () => {
  test('tags every record with csv-import provenance', () => {
    const stores = makeStores();
    importCsv(csv(ROW_A, ROW_B), stores);
    const metrics = stores.metricsStore.getState().metrics;
    expect(metrics).toHaveLength(2);
    metrics.forEach((m) => {
      expect(m.source).toBe('csv-import');
      expect(m.catalogSlug).toBe('test-catalog');
      expect(m.importedAt).toBeTruthy();
    });
  });

  test('re-import of the same catalogSlug replaces, never duplicates', () => {
    const stores = makeStores();
    importCsv(csv(ROW_A, ROW_B), stores);
    const result = importCsv(csv(ROW_B), stores);
    expect(result.replaced).toBe(true);
    const metrics = stores.metricsStore.getState().metrics;
    expect(metrics).toHaveLength(1);
    expect(metrics[0].id).toBe('ALMA-1');
  });

  test('a different catalogSlug is untouched by re-import', () => {
    const stores = makeStores({
      metrics: [{ id: 'OTHER-1', catalogSlug: 'other-catalog', source: 'csv-import' }]
    });
    importCsv(csv(ROW_B), stores);
    const slugs = stores.metricsStore.getState().metrics.map((m) => m.catalogSlug).sort();
    expect(slugs).toEqual(['other-catalog', 'test-catalog']);
  });

  test('rejected validation throws and writes nothing', () => {
    const stores = makeStores();
    const v = validateMetricsCatalog(parseMetricsCSV(csv('M-1,Name,gauge,ID.AM-01,,,,,,,,,,')));
    expect(() => importMetricsCatalog(v, stores, { catalogSlug: 'x' })).toThrow(/invalid type/);
    expect(stores.metricsStore.getState().metrics).toHaveLength(0);
  });
});

describe('share export — metrics leak guards', () => {
  const userAssessment = (metricId) => ({
    id: 'ASM-user-1',
    name: 'User assessment',
    observations: {
      'r-2': {
        auditorId: '',
        quarters: {
          Q1: { actualScore: 2, targetScore: 3, observations: 'user note', metricId }
        }
      }
    }
  });

  test('imported metric TEXT is absent from the default share export', () => {
    const stores = makeStores();
    importCsv(csv(ROW_A), stores, 'cis-v7-mm');
    const out = JSON.stringify(buildShareableExport(stores));
    expect(out).not.toContain('secret-cis-note');
    expect(out).not.toContain('Networks without recent active discovery scans');
  });

  test('linkage identifiers are absent — metric_id and catalogSlug do not ride on user-authored quarters', () => {
    const stores = makeStores({ assessments: [userAssessment('CIS-1.1')] });
    importCsv(csv(ROW_A), stores, 'cis-v7-mm');
    const exported = buildShareableExport(stores);
    const out = JSON.stringify(exported);
    expect(out).not.toContain('CIS-1.1');
    expect(out).not.toContain('cis-v7-mm');
    // the user's own value survives, only the link is stripped
    const quarter = exported.data.assessments[0].observations['r-2'].quarters.Q1;
    expect(quarter.actualScore).toBe(2);
    expect(quarter.metricId).toBeUndefined();
  });

  test('aggregate counts are recomputed post-filter', () => {
    const stores = makeStores();
    importCsv(csv(ROW_A, ROW_B), stores);
    const shared = buildShareableExport(stores);
    expect(shared.metadata.metricCount).toBe(0);
    expect(shared.data.metrics).toHaveLength(0);
    // backup export still carries everything
    const backup = exportAllDataJSON(stores);
    expect(backup.metadata.metricCount).toBe(2);
  });

  test('include-private opt-in still HARD-BLOCKS restricted-license metrics', () => {
    const stores = makeStores({ assessments: [userAssessment('CIS-1.1')] });
    importCsv(csv(ROW_A, ROW_B), stores, 'cis-v7-mm');
    const out = buildShareableExport(stores, { includePrivate: true });
    const text = JSON.stringify(out);
    // restricted CIS row: excluded even with the opt-in, link stripped
    expect(text).not.toContain('secret-cis-note');
    expect(text).not.toContain('CIS-1.1');
    expect(out.dataType).toMatch(/restricted-license metrics still excluded/);
    // unrestricted row: included by the opt-in
    expect(out.data.metrics.map((m) => m.id)).toEqual(['ALMA-1']);
    expect(out.metadata.metricCount).toBe(1);
  });

  test('defense-in-depth: a restricted metric with a NON-csv-import source is still dropped from the default share export', () => {
    const stores = makeStores({
      metrics: [{
        id: 'ROGUE-1', name: 'Hand-planted restricted metric', type: 'metric',
        subcategoryIds: ['ID.AM-01'], license: 'CC-BY-NC-ND-4.0',
        source: 'restored-backup', catalogSlug: 'rogue'
      }]
    });
    const out = buildShareableExport(stores);
    expect(JSON.stringify(out)).not.toContain('ROGUE-1');
    expect(out.metadata.metricCount).toBe(0);
  });

  test('store objects are not mutated by the export-side link strip', () => {
    const assessments = [userAssessment('CIS-1.1')];
    const stores = makeStores({ assessments });
    importCsv(csv(ROW_A), stores, 'cis-v7-mm');
    buildShareableExport(stores);
    expect(assessments[0].observations['r-2'].quarters.Q1.metricId).toBe('CIS-1.1');
  });
});

describe('backup/restore round-trip', () => {
  test('metrics section restores through importCompleteDatabase', () => {
    const stores = makeStores();
    importCsv(csv(ROW_A, ROW_B), stores);
    const backup = exportAllDataJSON(stores);

    const fresh = makeStores();
    expect(validateDatabaseExport(backup).ok).toBe(true);
    const result = importCompleteDatabase(backup, fresh, { backupFirst: false });
    expect(result.applied).toContain('metrics');
    expect(fresh.metricsStore.getState().metrics).toHaveLength(2);
  });

  test('format-2 export (no metrics section) restores with metrics skipped, not erased', () => {
    const stores = makeStores({ metrics: [{ id: 'KEEP-1', catalogSlug: 'keep', source: 'csv-import' }] });
    const legacy = exportAllDataJSON(stores);
    delete legacy.data.metrics;
    legacy.formatVersion = 2;
    const result = importCompleteDatabase(legacy, stores, { backupFirst: false });
    expect(result.skipped).toContain('metrics');
    expect(stores.metricsStore.getState().metrics).toHaveLength(1);
  });
});

describe('real metricsStore (zustand)', () => {
  test('replaceCatalog is idempotent and scoped; removeCatalog and setMetrics work', () => {
    const useMetricsStore = require('../stores/metricsStore').default;
    const s = () => useMetricsStore.getState();

    s().setMetrics([{ id: 'A-1', catalogSlug: 'a' }, { id: 'B-1', catalogSlug: 'b' }]);
    s().replaceCatalog('a', [{ id: 'A-2', catalogSlug: 'a' }]);
    expect(s().metrics.map((m) => m.id).sort()).toEqual(['A-2', 'B-1']);

    s().replaceCatalog('a', [{ id: 'A-2', catalogSlug: 'a' }]);
    expect(s().metrics).toHaveLength(2); // re-replace does not duplicate

    s().removeCatalog('a');
    expect(s().metrics.map((m) => m.id)).toEqual(['B-1']);

    expect(s().getCatalogs()).toEqual([
      expect.objectContaining({ catalogSlug: 'b', count: 1 })
    ]);
    s().setMetrics([]);
  });
});

describe('fixture catalogue', () => {
  const fixtureText = fs.readFileSync(path.join(__dirname, 'alma-security.metricsfixture.csv'), 'utf8');

  test('imports green end-to-end', () => {
    const stores = makeStores();
    const validation = validateMetricsCatalog(parseMetricsCSV(fixtureText));
    expect(validation.ok).toBe(true);
    expect(validation.records).toHaveLength(8);
    const result = importMetricsCatalog(validation, stores, {
      catalogSlug: catalogSlugFromFilename('alma-security.metricsfixture.csv')
    });
    expect(result.imported).toBe(8);
    expect(stores.metricsStore.getState().metrics.every((m) => m.catalogSlug === 'alma-security')).toBe(true);
  });

  test('is unrestricted — fictional demo content must never trip the license hard-block', () => {
    const validation = validateMetricsCatalog(parseMetricsCSV(fixtureText));
    expect(catalogIsRestricted(validation.records)).toBe(false);
  });

  test('round-trips through CSV export', () => {
    const validation = validateMetricsCatalog(parseMetricsCSV(fixtureText));
    const reExported = exportMetricsCatalogCSV(validation.records);
    const reValidated = validateMetricsCatalog(parseMetricsCSV(reExported));
    expect(reValidated.ok).toBe(true);
    expect(reValidated.records).toEqual(validation.records);
  });
});
