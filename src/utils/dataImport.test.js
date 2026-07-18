import { exportAllDataJSON, EXPORT_FORMAT_VERSION } from './dataExport';
import { validateDatabaseExport, importCompleteDatabase } from './dataImport';

/**
 * Round-trip and validation tests for the complete-database restore path.
 * Stores are mocked with the same getState() surface the real zustand stores
 * expose (data arrays + bulk setters).
 */

const SAMPLE = {
  users: [{ id: 'u1', name: 'Auditor One' }],
  controls: [{ id: 'c1', name: 'Access control' }],
  assessments: [{ id: 'a1', name: 'Assessment', observations: {} }],
  requirements: [{ id: 'GV.SC-04 Ex1', frameworkId: 'nist-csf-2.0' }],
  frameworks: [{ id: 'nist-csf-2.0', name: 'NIST CSF 2.0', isDefault: true }],
  artifacts: [{ id: 'art1', name: 'Policy doc' }],
  findings: [{ id: 'f1', title: 'Gap found' }],
  metrics: [{ id: 'm1', name: 'Patch latency', catalogSlug: 'sample', source: 'csv-import' }]
};

const makeStores = (data = SAMPLE) => {
  const setters = {
    setUsers: jest.fn(),
    setControls: jest.fn(),
    setAssessments: jest.fn(),
    setRequirements: jest.fn(),
    setFrameworks: jest.fn(),
    setArtifacts: jest.fn(),
    setFindings: jest.fn(),
    setMetrics: jest.fn(),
    setProfileState: jest.fn()
  };
  const stores = {
    userStore: { getState: () => ({ users: data.users, setUsers: setters.setUsers }) },
    controlsStore: { getState: () => ({ controls: data.controls, setControls: setters.setControls }) },
    assessmentsStore: { getState: () => ({ assessments: data.assessments, setAssessments: setters.setAssessments }) },
    requirementsStore: { getState: () => ({ requirements: data.requirements, setRequirements: setters.setRequirements }) },
    frameworksStore: { getState: () => ({ frameworks: data.frameworks, setFrameworks: setters.setFrameworks }) },
    artifactStore: { getState: () => ({ artifacts: data.artifacts, setArtifacts: setters.setArtifacts }) },
    findingsStore: { getState: () => ({ findings: data.findings, setFindings: setters.setFindings }) },
    metricsStore: { getState: () => ({ metrics: data.metrics, setMetrics: setters.setMetrics }) },
    orgProfileStore: { getState: () => ({ profile: null, cloudConsent: false, setProfileState: setters.setProfileState }) }
  };
  return { stores, setters };
};

afterEach(() => {
  window.localStorage.clear();
});

describe('export → restore round-trip', () => {
  test('every section survives the round-trip via its bulk setter', () => {
    const { stores } = makeStores();
    const exported = exportAllDataJSON(stores);
    // Simulate save/reload through JSON, exactly like a real backup file
    const parsed = JSON.parse(JSON.stringify(exported));

    const { stores: targetStores, setters } = makeStores();
    const result = importCompleteDatabase(parsed, targetStores, { backupFirst: false });

    expect(result.applied).toEqual(
      expect.arrayContaining(['users', 'controls', 'assessments', 'requirements', 'frameworks', 'artifacts', 'findings'])
    );
    expect(setters.setUsers).toHaveBeenCalledWith(SAMPLE.users);
    expect(setters.setAssessments).toHaveBeenCalledWith(SAMPLE.assessments);
    expect(setters.setFindings).toHaveBeenCalledWith(SAMPLE.findings);
    expect(setters.setFrameworks).toHaveBeenCalledWith(SAMPLE.frameworks);
  });

  test('export carries formatVersion and a findings section', () => {
    const { stores } = makeStores();
    const exported = exportAllDataJSON(stores);
    expect(exported.formatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(exported.data.findings).toEqual(SAMPLE.findings);
  });
});

describe('validateDatabaseExport', () => {
  test('rejects a file from a newer app (formatVersion ahead)', () => {
    const result = validateDatabaseExport({ formatVersion: EXPORT_FORMAT_VERSION + 1, data: { users: [] } });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/newer version/i);
  });

  test('rejects a section exported at a newer schema than this app persists', () => {
    window.localStorage.setItem('csf-assessments-storage', JSON.stringify({ state: {}, version: 9 }));
    const result = validateDatabaseExport({
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: 10 },
      data: { assessments: [] }
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(' ')).toMatch(/schema v10/);
  });

  test('accepts a legacy v1.0 export with a warning about missing findings', () => {
    const result = validateDatabaseExport({
      version: '1.0',
      data: { users: [], assessments: [] }
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.join(' ')).toMatch(/findings/i);
  });

  test('rejects non-export JSON', () => {
    expect(validateDatabaseExport({ hello: 'world' }).ok).toBe(false);
    expect(validateDatabaseExport([1, 2, 3]).ok).toBe(false);
    expect(validateDatabaseExport(null).ok).toBe(false);
  });
});

describe('importCompleteDatabase safety semantics', () => {
  test('an empty frameworks section rejects the whole file (damaged export)', () => {
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      data: { users: [{ id: 'u9' }], frameworks: [] }
    };
    expect(() => importCompleteDatabase(parsed, stores, { backupFirst: false })).toThrow(/frameworks/i);
    expect(setters.setFrameworks).not.toHaveBeenCalled();
    expect(setters.setUsers).not.toHaveBeenCalled();
  });

  test('assessments exported at an OLDER schema are migrated before they reach the store', () => {
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: 0 },
      data: {
        assessments: [{
          id: 'ASM-old',
          name: 'Old export',
          scopeType: 'controls',
          scopeIds: ['GV.SC-04'],
          observations: {
            'GV.SC-04': { actualScore: 2, targetScore: 3, observations: 'legacy note' }
          }
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const old = written.find(a => a.id === 'ASM-old');
    // v1 migration ran: quarterly structure
    expect(old.observations['GV.SC-04'].quarters.Q1.actualScore).toBe(2);
    // v4/v5 migration ran: scopeType corrected
    expect(old.scopeType).toBe('requirements');
    // v6+ migrations ran: default audit assessment appended
    expect(written.some(a => a.id === 'ASM-audit-2025-alma')).toBe(true);
  });

  test('a v9 export (no scoringScale) restores with scale 10 stamped; scores untouched (issue #277)', () => {
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: 9 },
      data: {
        assessments: [{
          id: 'ASM-v9',
          name: 'Pre-scale export',
          scopeType: 'requirements',
          scopeIds: ['GV.SC-04 Ex1'],
          observations: {
            'GV.SC-04 Ex1': { quarters: { Q1: { actualScore: 7.5, targetScore: 9 } } }
          }
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-v9');
    expect(restored.scoringScale).toBe(10);
    expect(restored.observations['GV.SC-04 Ex1'].quarters.Q1.actualScore).toBe(7.5);
    expect(restored.observations['GV.SC-04 Ex1'].quarters.Q1.targetScore).toBe(9);
  });

  test('a 5-point assessment keeps its scale through restore (issue #277)', () => {
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: 9 },
      data: {
        assessments: [{
          id: 'ASM-cmmi',
          name: 'CMMI-scale assessment',
          scopeType: 'requirements',
          scoringScale: 5,
          scopeIds: ['GV.SC-04 Ex1'],
          observations: {
            'GV.SC-04 Ex1': { quarters: { Q1: { actualScore: 3.25, targetScore: 4 } } }
          }
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-cmmi');
    expect(restored.scoringScale).toBe(5);
    expect(restored.observations['GV.SC-04 Ex1'].quarters.Q1.actualScore).toBe(3.25);
  });

  test('a mid-apply setter failure rolls back every already-applied section', () => {
    const { stores, setters } = makeStores();
    // users applies first, then findings throws
    stores.findingsStore = {
      getState: () => ({
        findings: [{ id: 'f-prior' }],
        setFindings: () => { throw new Error('quota exceeded'); }
      })
    };
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      data: { users: [{ id: 'u-new' }], findings: [{ id: 'f-new' }] }
    };
    expect(() => importCompleteDatabase(parsed, stores, { backupFirst: false })).toThrow(/rolled back/i);
    // setUsers was called with the new value, then rolled back to the prior value
    expect(setters.setUsers).toHaveBeenCalledWith([{ id: 'u-new' }]);
    expect(setters.setUsers).toHaveBeenLastCalledWith(SAMPLE.users);
  });

  test('sections absent from the file are left untouched', () => {
    const { stores, setters } = makeStores();
    const parsed = { formatVersion: EXPORT_FORMAT_VERSION, data: { users: [{ id: 'u1' }] } };
    const result = importCompleteDatabase(parsed, stores, { backupFirst: false });
    expect(result.skipped).toEqual(expect.arrayContaining(['findings', 'assessments']));
    expect(setters.setFindings).not.toHaveBeenCalled();
  });

  test('a missing bulk setter aborts BEFORE any store is mutated', () => {
    const { stores, setters } = makeStores();
    // Break the LAST section's setter; earlier sections must not be applied
    stores.findingsStore = { getState: () => ({ findings: [] }) };
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      data: { users: [{ id: 'u1' }], findings: [{ id: 'f1' }] }
    };
    expect(() => importCompleteDatabase(parsed, stores, { backupFirst: false })).toThrow(/before any data/i);
    expect(setters.setUsers).not.toHaveBeenCalled();
  });
});
