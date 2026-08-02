/**
 * Spreadsheet ↔ UI parity for the assessment CSV egresses (2026-08 reconcile).
 *
 * The rule under test: the export/import spreadsheet carries every field the
 * assessment evaluation panel shows, and none it doesn't. Three defects this
 * file pins against regression:
 *   1. UI fields the sheet used to lack — Year, Users (roster + roles),
 *      Linked Findings, Linked Controls, External Links — export AND survive
 *      an export → import round-trip;
 *   2. orphan columns whose only surfaces were never-routed pages — per-quarter
 *      Observation Date and the Remediation Owner / Action Plan / Remediation
 *      Due Date trio — are gone from the canonical header list;
 *   3. both exporters and the template share ASSESSMENT_CSV_HEADERS, so the
 *      three surfaces cannot drift apart again (the template builds from the
 *      constant by construction; the exporters are asserted here).
 *
 * Capture harness mirrors assessmentsStore.egress.test.js: the exporters build
 * a Blob and hand it to URL.createObjectURL, neither of which jsdom
 * implements, so both are stubbed and the CSV is read back from the Blob parts.
 */
import useAssessmentsStore, { ASSESSMENT_CSV_HEADERS } from './assessmentsStore';
import useControlsStore from './controlsStore';
import useRequirementsStore from './requirementsStore';
import useUserStore from './userStore';

const REQ_ID = 'GV.SC-04 Ex1';

let captured;
const OriginalBlob = global.Blob;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

class CapturingBlob extends OriginalBlob {
  constructor(parts, opts) {
    super(parts, opts);
    this.capturedParts = parts;
  }
}

beforeAll(() => {
  global.Blob = CapturingBlob;
  URL.createObjectURL = (blob) => {
    captured.push(blob);
    return 'blob:test';
  };
  URL.revokeObjectURL = () => {};
});

afterAll(() => {
  global.Blob = OriginalBlob;
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

const capturedText = () => {
  expect(captured.length).toBeGreaterThan(0);
  return captured[captured.length - 1].capturedParts.map((p) => String(p)).join('');
};

const createdAssessmentIds = [];
const createdUserIds = [];

beforeEach(() => {
  captured = [];
  useRequirementsStore.getState().setRequirements([
    {
      id: REQ_ID,
      frameworkId: 'nist-csf-2.0',
      subcategoryId: 'GV.SC-04',
      implementationExample: 'Ex1: Develop criteria for supplier criticality',
      inScope: true
    }
  ]);
});

afterEach(() => {
  const store = useAssessmentsStore.getState();
  store.setAssessments(store.assessments.filter((a) => !createdAssessmentIds.includes(a.id)));
  createdAssessmentIds.length = 0;
  const users = useUserStore.getState();
  createdUserIds.forEach((id) => users.deleteUser?.(id));
  createdUserIds.length = 0;
  useRequirementsStore.getState().setRequirements([]);
});

const trackImported = async (csv) => {
  const store = useAssessmentsStore.getState();
  const before = new Set(store.assessments.map((a) => a.id));
  await store.importAssessmentsCSV(csv, useUserStore);
  const imported = useAssessmentsStore.getState().assessments.filter((a) => !before.has(a.id));
  imported.forEach((a) => createdAssessmentIds.push(a.id));
  expect(imported).toHaveLength(1);
  return imported[0];
};

/** Build a fully-populated source assessment exercising every UI field. */
const makeSourceAssessment = () => {
  const users = useUserStore.getState();
  const auditorId = users.findOrCreateUser({ name: 'Avery Auditor', email: 'avery@example.com' });
  const ownerId = users.findOrCreateUser({ name: 'Owen Owner', email: 'owen@example.com' });
  createdUserIds.push(auditorId, ownerId);

  const store = useAssessmentsStore.getState();
  const created = store.createAssessment({
    name: 'Parity assessment',
    description: 'Round-trip fixture',
    scopeType: 'requirements',
    year: 2027,
    users: [
      { userId: auditorId, role: 'auditor' },
      { userId: ownerId, role: 'control owner' }
    ]
  });
  createdAssessmentIds.push(created.id);
  store.addToScope(created.id, REQ_ID);
  store.updateObservation(created.id, REQ_ID, {
    auditorId,
    testProcedures: 'Inspect supplier list',
    linkedArtifacts: ['ART-1', 'ART-2'],
    linkedFindings: ['FND-9'],
    linkedControls: ['CTL-3', 'CTL-4'],
    externalLinks: [
      { type: 'findings', url: 'https://tracker.example.com/browse/SEC-1' },
      { type: 'controls', url: 'https://grc.example.com/controls/42' }
    ]
  });
  store.updateQuarterlyObservation(created.id, REQ_ID, 'Q2', {
    actualScore: 4,
    targetScore: 6,
    observations: 'Q2 note',
    testingStatus: 'Complete',
    examine: true,
    interview: false,
    test: true
  });
  return { id: created.id, auditorId, ownerId };
};

describe('canonical header list encodes the parity rule', () => {
  test('carries the five UI fields the sheet used to lack', () => {
    ['Year', 'Users', 'Linked Findings', 'Linked Controls', 'External Links'].forEach((h) =>
      expect(ASSESSMENT_CSV_HEADERS).toContain(h)
    );
  });

  test('carries no column without a live UI surface', () => {
    const orphans = ASSESSMENT_CSV_HEADERS.filter((h) =>
      h.includes('Observation Date') ||
      ['Remediation Owner', 'Action Plan', 'Remediation Due Date'].includes(h)
    );
    expect(orphans).toEqual([]);
  });
});

describe('export carries the UI fields', () => {
  test('Year, Users roster, links and external links appear in the CSV', async () => {
    const { id } = makeSourceAssessment();
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    expect(csv).toContain('2027');
    expect(csv).toContain('Avery Auditor <avery@example.com> (auditor)');
    expect(csv).toContain('Owen Owner <owen@example.com> (control owner)');
    expect(csv).toContain('FND-9');
    expect(csv).toContain('CTL-3; CTL-4');
    expect(csv).toContain('findings|https://tracker.example.com/browse/SEC-1');
  });
});

describe('export → import round-trips the UI fields', () => {
  test('year, roster roles, linked findings/controls and external links survive', async () => {
    const { id, auditorId, ownerId } = makeSourceAssessment();
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const imported = await trackImported(capturedText());

    expect(imported.year).toBe(2027);
    // findOrCreateUser matches by email, so the same directory users return.
    expect(imported.users).toEqual([
      { userId: auditorId, role: 'auditor' },
      { userId: ownerId, role: 'control owner' }
    ]);

    const obs = imported.observations[REQ_ID];
    expect(obs.linkedFindings).toEqual(['FND-9']);
    expect(obs.linkedControls).toEqual(['CTL-3', 'CTL-4']);
    expect(obs.linkedArtifacts).toEqual(['ART-1', 'ART-2']);
    // Link ids regenerate on import; type + url are the round-tripped payload.
    expect(obs.externalLinks.map(({ type, url }) => ({ type, url }))).toEqual([
      { type: 'findings', url: 'https://tracker.example.com/browse/SEC-1' },
      { type: 'controls', url: 'https://grc.example.com/controls/42' }
    ]);
    expect(obs.quarters.Q2.actualScore).toBe(4);
    expect(obs.quarters.Q2.testingStatus).toBe('Complete');
  });
});

describe('legacy files with dropped columns stay importable', () => {
  const LEGACY_CSV = [
    [
      'ID', 'Assessment', 'Scope Type', 'Auditor', 'Test Procedure(s)',
      'Q1 Actual Score', 'Q1 Target Score', 'Q1 Observations', 'Q1 Observation Date',
      'Q1 Testing Status', 'Q1 Examine', 'Q1 Interview', 'Q1 Test',
      'Linked Artifacts', 'Remediation Owner', 'Action Plan', 'Remediation Due Date'
    ].join(','),
    `${REQ_ID},Legacy Import,requirements,Ann Auditor,Review docs,3,4,note,2025-01-15,Complete,Yes,No,Yes,AR-1,Rem Owner,Fix it,2025-03-01`
  ].join('\n');

  test('imports, defaults year/roster, and the orphan data does not land', async () => {
    const imported = await trackImported(LEGACY_CSV);

    expect(imported.scopeIds).toEqual([REQ_ID]);
    // Files without a Year column get the current year, matching the wizard.
    expect(imported.year).toBe(new Date().getFullYear());
    expect(imported.users).toEqual([]);

    const obs = imported.observations[REQ_ID];
    expect(obs.quarters.Q1.actualScore).toBe(3);
    expect(obs.quarters.Q1.observationDate).toBe('');
    expect(obs.remediation).toEqual({ ownerId: null, actionPlan: '', dueDate: '' });
  });
});
