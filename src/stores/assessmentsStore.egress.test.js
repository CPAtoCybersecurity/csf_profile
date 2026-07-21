/**
 * CSV/Jira egress × the expansion choke point (plan §7 R-3/R-9; PR-5).
 *
 * Every text egress of procedure text must route through
 * expandProcedureText: an observation carrying platform REFERENCES must ship
 * the expanded addendum text (with attribution) in the exported artifact,
 * and an unresolvable reference must ship its explicit placeholder — never
 * silently drop. One test per exporter, so an expansion-skipping mutant in
 * ANY of the four egresses fails its own test.
 *
 * Capture harness: the exporters build a Blob and hand it to
 * URL.createObjectURL — jsdom implements neither, so both are stubbed and
 * the CSV text is read back from the captured Blob parts.
 */
import useAssessmentsStore from './assessmentsStore';
import useControlsStore from './controlsStore';
import useRequirementsStore from './requirementsStore';
import useUserStore from './userStore';
import bank from '../data/platformProcedures.json';
import { buildPlatformRef } from '../utils/platformBank';
import { getBankProcedure } from '../utils/procedureBank';
import { bankAttachObservation } from '../utils/procedureTailor';

const REAL_POLICY = 'ms.aad.1.1v1';
const realRecord = bank.procedures[REAL_POLICY];
const DEAD_REF = {
  corpusId: 'foreign-corpus',
  corpusVersion: 'ffffffffffffffff',
  policyId: 'gone.policy.1.1v1',
  contentHash: '0123456789abcdef'
};

let captured;
const OriginalBlob = global.Blob;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

// jsdom's Blob has no .text(); retain the constructor parts for read-back.
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

const capturedText = async () => {
  expect(captured.length).toBeGreaterThan(0);
  const blob = captured[captured.length - 1];
  return blob.capturedParts.map((p) => String(p)).join('');
};

let assessmentId;

beforeEach(() => {
  captured = [];
  const assessments = useAssessmentsStore.getState();
  const created = assessments.createAssessment({
    name: 'Egress expansion assessment',
    scopeType: 'requirements'
  });
  assessmentId = created.id;
  assessments.addToScope(assessmentId, 'PR.DS-01 Ex1');
  // Real attach producer for the trunk, then the reference lane: one
  // resolvable corpus ref + one dead ref on the same observation.
  assessments.updateObservation(assessmentId, 'PR.DS-01 Ex1', {
    ...bankAttachObservation(getBankProcedure('PR.DS-01')),
    platformProcedures: [buildPlatformRef(realRecord), DEAD_REF]
  });
  assessments.updateQuarterlyObservation(assessmentId, 'PR.DS-01 Ex1', 'Q1', {
    actualScore: 3,
    targetScore: 4,
    observations: 'Quarter note',
    testingStatus: 'Complete',
    examine: true,
    interview: false,
    test: true
  });
});

afterEach(() => {
  const assessments = useAssessmentsStore.getState();
  assessments.setAssessments(
    assessments.assessments.filter((a) => a.id !== assessmentId)
  );
});

const expectExpandedProcedureText = (csv) => {
  // resolvable ref: addendum substance + attribution assert from provenance
  expect(csv).toContain(realRecord.assertion);
  expect(csv).toContain('Portions adapted from Microsoft');
  // unresolvable ref: explicit identity-carrying placeholder, never dropped
  expect(csv).toContain('Unresolved platform procedure reference');
  expect(csv).toContain(DEAD_REF.policyId);
  // trunk still present
  expect(csv).toContain('PR.DS-01');
};

describe('the four CSV/Jira egresses expand through the choke point', () => {
  test('exportAssessmentCSV', async () => {
    useAssessmentsStore
      .getState()
      .exportAssessmentCSV(assessmentId, useControlsStore, useRequirementsStore, useUserStore);
    expectExpandedProcedureText(await capturedText());
  });

  test('exportForJiraCSV (custom field AND description)', async () => {
    useAssessmentsStore
      .getState()
      .exportForJiraCSV(assessmentId, useControlsStore, useRequirementsStore, useUserStore);
    const csv = await capturedText();
    expectExpandedProcedureText(csv);
    // the Description column embeds the expanded text too — assert the
    // assertion appears at least twice (field + description)
    expect(csv.split(realRecord.assertion).length).toBeGreaterThanOrEqual(3);
  });

  test('exportAllForJiraCSV', async () => {
    useAssessmentsStore
      .getState()
      .exportAllForJiraCSV(useControlsStore, useRequirementsStore, useUserStore);
    expectExpandedProcedureText(await capturedText());
  });

  test('exportAllAssessmentsCSV', async () => {
    useAssessmentsStore
      .getState()
      .exportAllAssessmentsCSV(useControlsStore, useRequirementsStore, useUserStore);
    expectExpandedProcedureText(await capturedText());
  });
});

describe('store passthrough safety', () => {
  test('updateObservation persists references unmangled; quarterly-shaped observations never re-migrate', () => {
    const obs = useAssessmentsStore.getState().getObservation(assessmentId, 'PR.DS-01 Ex1');
    expect(obs.platformProcedures).toHaveLength(2);
    expect(obs.platformProcedures[1]).toEqual(DEAD_REF);
    // the getter default for an untouched item has no platform keys
    const fresh = useAssessmentsStore.getState().getObservation(assessmentId, 'ZZ.ZZ-99 Ex1');
    expect('platformProcedures' in fresh).toBe(false);
  });

  test('a text-only edit keeps the references and flips modified (provenance honesty unchanged)', () => {
    useAssessmentsStore.getState().updateObservation(assessmentId, 'PR.DS-01 Ex1', {
      testProcedures: 'hand-edited trunk'
    });
    const obs = useAssessmentsStore.getState().getObservation(assessmentId, 'PR.DS-01 Ex1');
    expect(obs.platformProcedures).toHaveLength(2);
    expect(obs.procedureSource.modified).toBe(true);
  });
});
