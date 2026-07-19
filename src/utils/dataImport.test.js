import { exportAllDataJSON, EXPORT_FORMAT_VERSION } from './dataExport';
import { validateDatabaseExport, importCompleteDatabase } from './dataImport';
import { ASSESSMENTS_SCHEMA_VERSION } from '../stores/assessmentsStore';

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
    // Assessments additionally get the externalTracking shape (issue #288)
    // and the year/users fields (issues #291/#290) guaranteed on restore by
    // the unconditional normalize — everything else is byte-identical to the
    // exported section.
    expect(setters.setAssessments).toHaveBeenCalledWith(
      SAMPLE.assessments.map(a => ({
        ...a,
        externalTracking: { enabled: false, systems: { findings: '', artifacts: '', controls: '' } },
        year: new Date().getFullYear(),
        users: []
      }))
    );
    expect(setters.setFindings).toHaveBeenCalledWith(SAMPLE.findings);
    expect(setters.setFrameworks).toHaveBeenCalledWith(SAMPLE.frameworks);
  });

  test('export carries formatVersion and a findings section', () => {
    const { stores } = makeStores();
    const exported = exportAllDataJSON(stores);
    expect(exported.formatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(exported.data.findings).toEqual(SAMPLE.findings);
  });

  test('an artifact assessmentId survives the round-trip (issue #297)', () => {
    const data = {
      ...SAMPLE,
      artifacts: [{ id: 'art1', artifactId: 'AR-mine', name: 'Policy doc', assessmentId: 'ASM-user-2026' }]
    };
    const { stores } = makeStores(data);
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores)));
    const { stores: targetStores, setters } = makeStores();
    importCompleteDatabase(parsed, targetStores, { backupFirst: false });
    expect(setters.setArtifacts).toHaveBeenCalledWith(data.artifacts);
  });

  test('a pre-#297 backup gets its demo records stamped on restore (issue #297)', () => {
    // What an old backup actually holds: seeded demo copies without the new
    // fields, alongside the user's own records.
    const { SEEDED_ARTIFACTS } = require('../stores/artifactStore');
    const { DEFAULT_USERS } = require('../stores/userStore');
    const { assessmentId, seedSource, ...legacyDemoArtifact } = SEEDED_ARTIFACTS[0];
    const { seedSource: _s, ...legacyDemoUser } = DEFAULT_USERS[0];
    const mineArtifact = { id: 'art-mine', artifactId: 'AR-mine', name: 'My evidence' };

    const data = {
      ...SAMPLE,
      artifacts: [legacyDemoArtifact, mineArtifact],
      users: [legacyDemoUser]
    };
    const { stores } = makeStores(data);
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores)));
    const { stores: targetStores, setters } = makeStores();
    importCompleteDatabase(parsed, targetStores, { backupFirst: false });

    const restoredArtifacts = setters.setArtifacts.mock.calls[0][0];
    expect(restoredArtifacts[0].assessmentId).toBe(SEEDED_ARTIFACTS[0].assessmentId);
    expect(restoredArtifacts[0].seedSource).toBe('demo-alma');
    expect(restoredArtifacts[1]).toEqual(mineArtifact); // user record untouched

    const restoredUsers = setters.setUsers.mock.calls[0][0];
    expect(restoredUsers[0].seedSource).toBe('demo-alma');
  });

  test('a foreign backup cannot get real data mis-branded as demo on restore (issue #297)', () => {
    const { SEEDED_ARTIFACTS } = require('../stores/artifactStore');
    // Same NAME as a shipped demo artifact but the user's own artifactId:
    // the positive id+name guard must leave it untouched.
    const sameNameMine = { id: 'a-1', artifactId: 'AR-my-own', name: SEEDED_ARTIFACTS[0].name };
    // Same id+name but already classified by the exporting install: the
    // absent-only rule must never overwrite an existing classification.
    const alreadyClassified = {
      ...SEEDED_ARTIFACTS[0],
      assessmentId: undefined,
      seedSource: 'user'
    };
    delete alreadyClassified.assessmentId;

    const data = { ...SAMPLE, artifacts: [sameNameMine, alreadyClassified] };
    const { stores } = makeStores(data);
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores)));
    const { stores: targetStores, setters } = makeStores();
    importCompleteDatabase(parsed, targetStores, { backupFirst: false });

    const restored = setters.setArtifacts.mock.calls[0][0];
    expect(restored[0]).toEqual(sameNameMine);          // untouched
    expect(restored[1].seedSource).toBe('user');        // classification kept
    expect(restored[1].assessmentId).toBeUndefined();   // not demo-stamped
  });

  test('a pre-#299 backup gets its demo controls stamped on restore, user controls untouched (issue #299)', () => {
    const { SEEDED_CONTROLS } = require('../stores/controlsStore');
    // What an old backup holds: a seeded demo control without the new fields,
    // a user control that reuses a seeded controlId (different createdDate),
    // and a plain user control.
    const { assessmentId, seedSource, ...legacyDemoControl } = SEEDED_CONTROLS[0];
    const collidingMine = {
      ...legacyDemoControl,
      createdDate: '2026-05-05T10:00:00.000Z'
    };
    const mineControl = { controlId: 'CTL-mine', implementationDescription: 'Mine', createdDate: '2026-01-01T00:00:00.000Z' };

    const data = { ...SAMPLE, controls: [legacyDemoControl, collidingMine, mineControl] };
    const { stores } = makeStores(data);
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores)));
    const { stores: targetStores, setters } = makeStores();
    importCompleteDatabase(parsed, targetStores, { backupFirst: false });

    const restored = setters.setControls.mock.calls[0][0];
    expect(restored[0].assessmentId).toBe(SEEDED_CONTROLS[0].assessmentId);
    expect(restored[0].seedSource).toBe('demo-alma');
    expect(restored[1]).toEqual(collidingMine);   // colliding id, different createdDate — untouched
    expect(restored[2]).toEqual(mineControl);     // user record untouched
  });

  test('a current-format backup round-trips control assessmentIds verbatim (issue #299)', () => {
    const scoped = { controlId: 'CTL-9', implementationDescription: 'Scoped', assessmentId: 'ASM-user-2026', createdDate: '2026-01-01T00:00:00.000Z' };
    const data = { ...SAMPLE, controls: [scoped] };
    const { stores } = makeStores(data);
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores)));
    const { stores: targetStores, setters } = makeStores();
    importCompleteDatabase(parsed, targetStores, { backupFirst: false });
    expect(setters.setControls.mock.calls[0][0]).toEqual([scoped]);
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
    // v14 migration ran: the legacy demo assessments never reach the store
    // (issue #294 — only the comprehensive example ships)
    expect(written.some(a => a.id === 'ASM-audit-2025-alma')).toBe(false);
    expect(written.some(a => a.id === 'ASM-default-2025-alma')).toBe(false);
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

  test('a v10 export (no externalTracking) restores with the disabled default stamped (issue #284)', () => {
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: 10 },
      data: {
        assessments: [{
          id: 'ASM-v10',
          name: 'Pre-284 export',
          scopeType: 'requirements',
          scoringScale: 10,
          scopeIds: [],
          observations: {}
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-v10');
    expect(restored.externalTracking).toEqual({
      enabled: false,
      systems: { findings: '', artifacts: '', controls: '' }
    });
  });

  test('a v11 export converts the single system name to per-type slots on restore (issue #288)', () => {
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: 11 },
      data: {
        assessments: [{
          id: 'ASM-v11',
          name: 'Single-system export',
          scopeType: 'requirements',
          scoringScale: 10,
          scopeIds: [],
          observations: {},
          externalTracking: { enabled: true, systemName: 'Jira' }
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-v11');
    expect(restored.externalTracking).toEqual({
      enabled: true,
      systems: { findings: 'Jira', artifacts: 'Jira', controls: 'Jira' }
    });
  });

  test('a file claiming the current schema version is still shape-repaired (issue #288)', () => {
    // A tampered/hand-edited file can stamp the current version and skip the
    // migration chain — the unconditional normalize must repair it anyway.
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: ASSESSMENTS_SCHEMA_VERSION },
      data: {
        assessments: [{
          id: 'ASM-tampered',
          name: 'Claims current version, carries legacy shape',
          scopeType: 'requirements',
          scoringScale: 10,
          scopeIds: [],
          observations: {
            'GV.OC-01 Ex1': {
              externalLinks: [
                { type: 'findings', url: '  https://jira.example/browse/SEC-7  ' },
                { type: 'bogus', url: 'https://x.example' },
                { type: 'findings' }
              ],
              quarters: {}
            }
          },
          externalTracking: { enabled: true, systemName: 'Sneaky' }
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-tampered');
    expect(restored.externalTracking).toEqual({
      enabled: true,
      systems: { findings: 'Sneaky', artifacts: 'Sneaky', controls: 'Sneaky' }
    });
    const links = restored.observations['GV.OC-01 Ex1'].externalLinks;
    expect(links).toHaveLength(1);
    expect(links[0]).toEqual(expect.objectContaining({
      type: 'findings',
      url: 'https://jira.example/browse/SEC-7'
    }));
    expect(links[0].id).toBeTruthy();
  });

  test('a current-version file cannot smuggle PII inside assessment.users, and junk year is repaired (issues #290/#291)', () => {
    // users has NO share-export rebuild backstop (the share path spreads the
    // assessment and trusts the producer invariant) — so the restore-side
    // unconditional normalize is the only guard against a tampered v13 file.
    const { stores, setters } = makeStores();
    const parsed = {
      formatVersion: EXPORT_FORMAT_VERSION,
      storeVersions: { assessments: ASSESSMENTS_SCHEMA_VERSION },
      data: {
        assessments: [{
          id: 'ASM-pii-tamper',
          name: 'Claims current version, smuggles PII in users',
          scopeType: 'requirements',
          scoringScale: 10,
          scopeIds: [],
          createdDate: '2024-06-01T00:00:00.000Z',
          observations: {},
          year: 'not-a-year',
          users: [
            { userId: 5, role: 'auditor', name: 'Smuggled Person', email: 'smuggled@corp.example' },
            { userId: 5, role: 'stakeholder' },
            { userId: 6, role: 'not-a-role' }
          ]
        }]
      }
    };
    importCompleteDatabase(parsed, stores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-pii-tamper');
    expect(restored.users).toEqual([{ userId: 5, role: 'auditor' }]);
    expect(JSON.stringify(restored)).not.toContain('smuggled@corp.example');
    expect(JSON.stringify(restored)).not.toContain('Smuggled Person');
    expect(restored.year).toBe(2024); // junk year repaired to the record's createdDate vintage
  });

  test('observation external links round-trip through a complete backup (issue #288)', () => {
    const withLinks = {
      ...SAMPLE,
      assessments: [{
        id: 'ASM-links',
        name: 'Links round-trip',
        scopeType: 'requirements',
        scoringScale: 10,
        scopeIds: [],
        observations: {
          'GV.OC-01 Ex1': {
            externalLinks: [{ id: 'XL-rt-1', type: 'artifacts', url: 'https://sharepoint.example/sites/ev/AR-9' }],
            quarters: {}
          }
        },
        externalTracking: {
          enabled: true,
          systems: { findings: 'Jira', artifacts: 'SharePoint', controls: 'Hyperproof' }
        }
      }]
    };
    const { stores: sourceStores } = makeStores(withLinks);
    const backup = exportAllDataJSON(sourceStores);

    const { stores: targetStores, setters } = makeStores();
    importCompleteDatabase(backup, targetStores, { backupFirst: false });

    const written = setters.setAssessments.mock.calls[0][0];
    const restored = written.find(a => a.id === 'ASM-links');
    expect(restored.externalTracking.systems.artifacts).toBe('SharePoint');
    expect(restored.observations['GV.OC-01 Ex1'].externalLinks).toEqual([
      { id: 'XL-rt-1', type: 'artifacts', url: 'https://sharepoint.example/sites/ev/AR-9' }
    ]);
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
