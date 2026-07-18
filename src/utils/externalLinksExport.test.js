/**
 * External-URL share-export guards (issues #284/#288, PRIVATE_DATA.md).
 *
 * Ticket/document URLs name internal infrastructure (Jira/ServiceNow hosts,
 * SharePoint sites, project keys in paths). Default share exports scrub:
 *   - findings.externalUrl and findings.externalSystemId
 *   - artifacts.link        (pre-existing field — deliberate behavior change)
 *   - controls.externalUrl
 *   - assessments.externalTracking.systems (the configured system list)
 * The include-private opt-in keeps them; complete backups always keep them;
 * the scrub is copy-on-write and never mutates live store records.
 */
import { exportAllDataJSON, buildShareableExport } from './dataExport';
import useAssessmentsStore from '../stores/assessmentsStore';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import useControlsStore from '../stores/controlsStore';

const CANARY_SYS = 'CanaryTrack GRC';
const CANARY_SYS_2 = 'CanaryDocs SharePoint';
const CANARY_URL_F = 'https://jira.internal-canary.example/browse/SEC-9999';
const CANARY_URL_A = 'https://sharepoint.internal-canary.example/sites/evidence/AR-77';
const CANARY_URL_C = 'https://grc.internal-canary.example/controls/CTL-042';

const stores = () => ({
  assessmentsStore: useAssessmentsStore,
  findingsStore: useFindingsStore,
  artifactStore: useArtifactStore,
  controlsStore: useControlsStore
});

describe('external URLs in exports (issue #284)', () => {
  let assessmentId;
  let findingId;
  let artifactId;
  let controlId;

  beforeEach(() => {
    const assessment = useAssessmentsStore.getState().createAssessment({
      name: 'External tracking test',
      scopeType: 'requirements',
      externalTracking: {
        enabled: true,
        systems: [{ id: 'sys-1', name: CANARY_SYS }, { id: 'sys-2', name: CANARY_SYS_2 }]
      }
    });
    assessmentId = assessment.id;

    findingId = useFindingsStore.getState().createFinding({
      summary: 'Canary finding',
      assessmentId,
      externalUrl: CANARY_URL_F,
      externalSystemId: 'sys-2'
    }).id;

    // addArtifact returns the new record's id string
    artifactId = useArtifactStore.getState().addArtifact({
      name: 'Canary artifact',
      link: CANARY_URL_A
    });

    controlId = useControlsStore.getState().createControl({
      controlId: 'CTL-CANARY-284',
      implementationDescription: 'Canary control',
      externalUrl: CANARY_URL_C
    }).controlId;
  });

  afterEach(() => {
    useAssessmentsStore.getState().deleteAssessment(assessmentId);
    useFindingsStore.getState().deleteFinding(findingId);
    useArtifactStore.getState().deleteArtifact(artifactId);
    useControlsStore.getState().deleteControl(controlId);
  });

  test('createAssessment persists the wizard externalTracking choice (normalized, ids kept)', () => {
    const stored = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
    expect(stored.externalTracking).toEqual({
      enabled: true,
      systems: [{ id: 'sys-1', name: CANARY_SYS }, { id: 'sys-2', name: CANARY_SYS_2 }]
    });
  });

  test('createAssessment drops blank wizard rows and generates missing ids', () => {
    const a = useAssessmentsStore.getState().createAssessment({
      name: 'Draft rows test',
      scopeType: 'requirements',
      externalTracking: {
        enabled: true,
        systems: [{ id: 'draft-1', name: '  Jira  ' }, { id: 'draft-2', name: '' }, { name: 'Drive' }]
      }
    });
    expect(a.externalTracking).toEqual({
      enabled: true,
      systems: [{ id: 'draft-1', name: 'Jira' }, { id: 'sys-1', name: 'Drive' }]
    });
    useAssessmentsStore.getState().deleteAssessment(a.id);
  });

  test('complete backup keeps every external URL and the system name — that is its job', () => {
    const backup = exportAllDataJSON(stores());
    const serialized = JSON.stringify(backup);
    expect(serialized).toContain(CANARY_URL_F);
    expect(serialized).toContain(CANARY_URL_A);
    expect(serialized).toContain(CANARY_URL_C);
    expect(serialized).toContain(CANARY_SYS);
    expect(serialized).toContain(CANARY_SYS_2);
  });

  test('default share export scrubs every external-tracking field — whole-envelope assert', () => {
    const share = buildShareableExport(stores());
    const serialized = JSON.stringify(share);

    expect(serialized).not.toContain(CANARY_URL_F);
    expect(serialized).not.toContain(CANARY_URL_A);
    expect(serialized).not.toContain(CANARY_URL_C);
    expect(serialized).not.toContain(CANARY_SYS);
    expect(serialized).not.toContain(CANARY_SYS_2);
    expect(serialized).not.toContain('internal-canary.example');

    // Shape preserved: the fields exist but are blank; the enabled flag
    // (non-sensitive boolean) survives. The per-finding system reference is
    // blanked with the system list it points into.
    const assessment = share.data.assessments.find(a => a.id === assessmentId);
    expect(assessment.externalTracking).toEqual({ enabled: true, systems: [] });
    const sharedFinding = share.data.findings.find(f => f.id === findingId);
    expect(sharedFinding.externalUrl).toBe('');
    expect(sharedFinding.externalSystemId).toBe('');
    expect(share.data.artifacts.find(a => a.id === artifactId).link).toBe('');
    expect(share.data.controls.find(c => c.controlId === controlId).externalUrl).toBe('');
  });

  test('the scrub is copy-on-write — live store records are never mutated', () => {
    buildShareableExport(stores());

    expect(useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId)
      .externalTracking.systems.map((sys) => sys.name)).toEqual([CANARY_SYS, CANARY_SYS_2]);
    const liveFinding = useFindingsStore.getState().findings.find(f => f.id === findingId);
    expect(liveFinding.externalUrl).toBe(CANARY_URL_F);
    expect(liveFinding.externalSystemId).toBe('sys-2');
    expect(useArtifactStore.getState().artifacts.find(a => a.id === artifactId)
      .link).toBe(CANARY_URL_A);
    expect(useControlsStore.getState().controls.find(c => c.controlId === controlId)
      .externalUrl).toBe(CANARY_URL_C);
  });

  test('include-private opt-in keeps external URLs, the system list, and the system reference', () => {
    const share = buildShareableExport(stores(), { includePrivate: true });
    const serialized = JSON.stringify(share);
    expect(serialized).toContain(CANARY_URL_F);
    expect(serialized).toContain(CANARY_URL_A);
    expect(serialized).toContain(CANARY_URL_C);
    expect(serialized).toContain(CANARY_SYS);
    expect(serialized).toContain(CANARY_SYS_2);
    expect(share.data.findings.find(f => f.id === findingId).externalSystemId).toBe('sys-2');
  });

  test('the scrub survives unmigrated/junk-field records — rebuild, not spread (issue #288)', () => {
    // Historical masking class: leak tests that seed only through normalizing
    // producers can't catch a scrub regression. Bulk-set records the way a
    // buggy/legacy write path could leave them and assert the envelope.
    const prior = useAssessmentsStore.getState().assessments;
    useAssessmentsStore.getState().setAssessments([
      ...prior,
      {
        id: 'ASM-legacy-288',
        observations: {},
        scoringScale: 10,
        externalTracking: { enabled: true, systemName: 'LegacyCanary GRC' }
      },
      {
        id: 'ASM-junkfield-288',
        observations: {},
        scoringScale: 10,
        externalTracking: {
          enabled: true,
          systems: [{ id: 'sys-1', name: 'JunkCanary Tool' }],
          vendorNote: 'jira.junk-canary.example'
        }
      }
    ]);
    try {
      const serialized = JSON.stringify(buildShareableExport(stores()));
      expect(serialized).not.toContain('LegacyCanary');
      expect(serialized).not.toContain('JunkCanary');
      expect(serialized).not.toContain('junk-canary.example');
    } finally {
      useAssessmentsStore.getState().setAssessments(prior);
    }
  });

  test('updateAssessment normalizes an externalTracking update (producer guard)', () => {
    useAssessmentsStore.getState().updateAssessment(assessmentId, {
      externalTracking: { enabled: true, systemName: 'Updated Legacy' }
    });
    expect(useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId)
      .externalTracking).toEqual({ enabled: true, systems: [{ id: 'sys-1', name: 'Updated Legacy' }] });
  });

  test('cloneAssessment copies externalTracking without sharing object references', () => {
    const clone = useAssessmentsStore.getState().cloneAssessment(assessmentId, 'Clone 288');
    try {
      const original = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
      expect(clone.externalTracking).toEqual(original.externalTracking);
      expect(clone.externalTracking).not.toBe(original.externalTracking);
      expect(clone.externalTracking.systems[0]).not.toBe(original.externalTracking.systems[0]);
    } finally {
      useAssessmentsStore.getState().deleteAssessment(clone.id);
    }
  });

  test('createFinding and createControl default the external fields to empty strings', () => {
    const f = useFindingsStore.getState().createFinding({ summary: 'no url' });
    const c = useControlsStore.getState().createControl({ controlId: 'CTL-NOURL-284' });
    expect(f.externalUrl).toBe('');
    expect(f.externalSystemId).toBe('');
    expect(c.externalUrl).toBe('');
    useFindingsStore.getState().deleteFinding(f.id);
    useControlsStore.getState().deleteControl(c.controlId);
  });
});
