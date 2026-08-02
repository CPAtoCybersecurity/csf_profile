/**
 * Selective export — the wiring, driven end-to-end through the PRODUCTION
 * export entry points (not re-implemented here).
 *
 * The download is intercepted at the URL/anchor layer so each test reads the
 * bytes that would have hit disk plus the filename that would have been used —
 * the filename is load-bearing (`_subset` is what stops a slice being mistaken
 * for a backup), so it is asserted, not assumed.
 */

import {
  exportCompleteDatabase,
  exportShareableDatabase,
  exportAssessmentsJSON
} from './dataExport';
import { validateDatabaseExport } from './dataImport';
import { sectionDispositionGaps } from './assessmentSelection';

// ---- download capture ------------------------------------------------------

let captured;

const asStore = (state) => ({ getState: () => state });

const stores = () => ({
  controlsStore: asStore({ controls: [{ id: 'C1', controlId: 'CTRL-1' }] }),
  assessmentsStore: asStore({
    assessments: [
      { id: 'ASM-a', name: 'Alpha', scopeIds: ['GV.OC-01 Ex1'], observations: {} },
      { id: 'ASM-b', name: 'Bravo', scopeIds: ['ID.AM-01 Ex1'], observations: {} }
    ]
  }),
  requirementsStore: asStore({ requirements: [{ id: 'GV.OC-01 Ex1' }] }),
  frameworksStore: asStore({ frameworks: [{ id: 'nist-csf-2.0' }] }),
  artifactStore: asStore({
    artifacts: [
      { id: 'AR1', name: 'Alpha evidence', assessmentId: 'ASM-a' },
      { id: 'AR2', name: 'Bravo evidence', assessmentId: 'ASM-b' }
    ]
  }),
  userStore: asStore({ users: [{ id: 1, name: 'Auditor One' }] }),
  findingsStore: asStore({
    findings: [
      { id: 'F1', assessmentId: 'ASM-a' },
      { id: 'F2', assessmentId: 'ASM-b' }
    ]
  }),
  metricsStore: asStore({ metrics: [] }),
  orgProfileStore: asStore({ profile: null, cloudConsent: false }),
  inventoryStore: asStore({ systems: [] })
});

const OriginalBlob = global.Blob;

beforeEach(() => {
  captured = { filename: null, text: null };

  // jsdom Blobs expose no synchronous reader, so capture the parts the Blob is
  // constructed from — the same idiom controlFields.test.js and
  // assessmentsStore.egress.test.js already use.
  global.Blob = function CapturingBlob(parts) {
    captured.text = (parts || []).join('');
    return { parts };
  };
  global.URL.createObjectURL = jest.fn(() => 'blob:mock');
  global.URL.revokeObjectURL = jest.fn();

  jest.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
  jest.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

  const realCreate = document.createElement.bind(document);
  jest.spyOn(document, 'createElement').mockImplementation((tag) => {
    const el = realCreate(tag);
    if (tag === 'a') {
      el.click = jest.fn();
      const realSetAttribute = el.setAttribute.bind(el);
      el.setAttribute = (name, value) => {
        if (name === 'download') captured.filename = value;
        return realSetAttribute(name, value);
      };
    }
    return el;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
  global.Blob = OriginalBlob;
});

const readDownload = () => JSON.parse(captured.text);

// ---- complete database -----------------------------------------------------

describe('exportCompleteDatabase', () => {
  it('exports everything and keeps the backup filename when no selection is given', async () => {
    exportCompleteDatabase(stores());
    const out = readDownload();

    expect(out.data.assessments.map((a) => a.id)).toEqual(['ASM-a', 'ASM-b']);
    expect(captured.filename).toMatch(/^csf_assessment_\d{4}-\d{2}-\d{2}\.json$/);
    expect(out.metadata.assessmentSelection).toBeUndefined();
  });

  it('narrows to the selected assessment and cascades findings and artifacts', async () => {
    exportCompleteDatabase(stores(), { assessmentIds: ['ASM-a'] });
    const out = readDownload();

    expect(out.data.assessments.map((a) => a.id)).toEqual(['ASM-a']);
    expect(out.data.findings.map((f) => f.id)).toEqual(['F1']);
    expect(out.data.artifacts.map((a) => a.id)).toEqual(['AR1']);
  });

  it('marks a slice with a _subset filename so it cannot pass as a backup', () => {
    exportCompleteDatabase(stores(), { assessmentIds: ['ASM-a'] });
    expect(captured.filename).toMatch(/^csf_assessment_subset_\d{4}-\d{2}-\d{2}\.json$/);
  });
});

// ---- shareable -------------------------------------------------------------

describe('exportShareableDatabase', () => {
  it('keeps the share filename and full assessment list by default', async () => {
    exportShareableDatabase(stores());
    const out = readDownload();

    expect(out.data.assessments.map((a) => a.id)).toEqual(['ASM-a', 'ASM-b']);
    expect(captured.filename).toMatch(/^csf_share_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('narrows the share export and marks it _subset', async () => {
    exportShareableDatabase(stores(), { assessmentIds: ['ASM-b'] });
    const out = readDownload();

    expect(out.data.assessments.map((a) => a.id)).toEqual(['ASM-b']);
    expect(captured.filename).toMatch(/^csf_share_subset_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('still applies the share fold — the user directory stays omitted', async () => {
    exportShareableDatabase(stores(), { assessmentIds: ['ASM-b'] });
    const out = readDownload();

    // The privacy fold runs BEFORE narrowing, so its omissions survive it.
    expect(out.data.users).toBeUndefined();
  });
});

// ---- assessments-only ------------------------------------------------------

describe('exportAssessmentsJSON', () => {
  it('exports every assessment when no selection is given', async () => {
    exportAssessmentsJSON(
      stores().assessmentsStore,
      stores().controlsStore,
      stores().userStore
    );
    const out = readDownload();

    expect(out.count).toBe(2);
    expect(out.dataType).toBe('Assessments');
    expect(captured.filename).toMatch(/^assessments_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('exports only the selected assessment', async () => {
    exportAssessmentsJSON(
      stores().assessmentsStore,
      stores().controlsStore,
      stores().userStore,
      { assessmentIds: ['ASM-b'] }
    );
    const out = readDownload();

    expect(out.count).toBe(1);
    expect(out.assessments[0].id).toBe('ASM-b');
    expect(out.assessmentSelection).toEqual({
      selectedIds: ['ASM-b'],
      selectedCount: 1,
      totalCount: 2
    });
    expect(captured.filename).toMatch(/^assessments_subset_\d{4}-\d{2}-\d{2}\.json$/);
  });
});

// ---- section inventory -----------------------------------------------------

describe('section disposition covers the production envelope', () => {
  it('classifies every section exportAllDataJSON actually emits', () => {
    exportCompleteDatabase(stores());
    const out = readDownload();

    // Guards against the real failure mode: a new store section ships, rides
    // every subset export unclassified, and nobody notices until it leaks.
    expect(sectionDispositionGaps(out)).toEqual([]);
  });

  it('leaves the org-level sections whole in a subset', () => {
    exportCompleteDatabase(stores(), { assessmentIds: ['ASM-a'] });
    const out = readDownload();

    // None of these carry an assessmentId, so there is no correct way to
    // attribute them to a selection; their privacy is the share fold's job.
    expect(out.data.metrics).toEqual([]);
    expect(out.data.systems).toEqual([]);
    expect(out.data.orgProfile).toBeDefined();
    expect(out.data.controls).toHaveLength(1);
    expect(out.data.frameworks).toHaveLength(1);
  });

  it('leaks no excluded assessment id anywhere in a real subset payload', () => {
    exportCompleteDatabase(stores(), { assessmentIds: ['ASM-a'] });
    expect(captured.text).not.toContain('ASM-b');
    expect(captured.text).toContain('ASM-a');
  });
});

// ---- restore guard ---------------------------------------------------------

describe('validateDatabaseExport — selective-export guard', () => {
  it('warns that a slice is not a backup before a full-replace restore', async () => {
    exportCompleteDatabase(stores(), { assessmentIds: ['ASM-a'] });
    const slice = readDownload();

    const result = validateDatabaseExport(slice);
    expect(result.ok).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/SELECTIVE export \(1 of 2 assessments\)/);
  });

  it('does not warn on a full backup', async () => {
    exportCompleteDatabase(stores());
    const backup = readDownload();

    const result = validateDatabaseExport(backup);
    expect(result.warnings.join(' ')).not.toMatch(/SELECTIVE/);
  });
});
