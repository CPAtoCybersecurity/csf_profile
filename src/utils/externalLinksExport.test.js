/**
 * External-URL share-export guards (issue #284, PRIVATE_DATA.md).
 *
 * Ticket/document URLs name internal infrastructure (Jira/ServiceNow hosts,
 * SharePoint sites, project keys in paths). Default share exports scrub:
 *   - findings.externalUrl
 *   - artifacts.link        (pre-existing field — deliberate behavior change)
 *   - controls.externalUrl
 *   - assessments.externalTracking.systemName
 * The include-private opt-in keeps them; complete backups always keep them;
 * the scrub is copy-on-write and never mutates live store records.
 */
import { exportAllDataJSON, buildShareableExport } from './dataExport';
import useAssessmentsStore from '../stores/assessmentsStore';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import useControlsStore from '../stores/controlsStore';

const CANARY_SYS = 'CanaryTrack GRC';
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
      externalTracking: { enabled: true, systemName: CANARY_SYS }
    });
    assessmentId = assessment.id;

    findingId = useFindingsStore.getState().createFinding({
      summary: 'Canary finding',
      assessmentId,
      externalUrl: CANARY_URL_F
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

  test('createAssessment persists the wizard externalTracking choice', () => {
    const stored = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
    expect(stored.externalTracking).toEqual({ enabled: true, systemName: CANARY_SYS });
  });

  test('complete backup keeps every external URL and the system name — that is its job', () => {
    const backup = exportAllDataJSON(stores());
    const serialized = JSON.stringify(backup);
    expect(serialized).toContain(CANARY_URL_F);
    expect(serialized).toContain(CANARY_URL_A);
    expect(serialized).toContain(CANARY_URL_C);
    expect(serialized).toContain(CANARY_SYS);
  });

  test('default share export scrubs all four fields — whole-envelope assert', () => {
    const share = buildShareableExport(stores());
    const serialized = JSON.stringify(share);

    expect(serialized).not.toContain(CANARY_URL_F);
    expect(serialized).not.toContain(CANARY_URL_A);
    expect(serialized).not.toContain(CANARY_URL_C);
    expect(serialized).not.toContain(CANARY_SYS);
    expect(serialized).not.toContain('internal-canary.example');

    // Shape preserved: the fields exist but are blank; the enabled flag
    // (non-sensitive boolean) survives.
    const assessment = share.data.assessments.find(a => a.id === assessmentId);
    expect(assessment.externalTracking).toEqual({ enabled: true, systemName: '' });
    expect(share.data.findings.find(f => f.id === findingId).externalUrl).toBe('');
    expect(share.data.artifacts.find(a => a.id === artifactId).link).toBe('');
    expect(share.data.controls.find(c => c.controlId === controlId).externalUrl).toBe('');
  });

  test('the scrub is copy-on-write — live store records are never mutated', () => {
    buildShareableExport(stores());

    expect(useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId)
      .externalTracking.systemName).toBe(CANARY_SYS);
    expect(useFindingsStore.getState().findings.find(f => f.id === findingId)
      .externalUrl).toBe(CANARY_URL_F);
    expect(useArtifactStore.getState().artifacts.find(a => a.id === artifactId)
      .link).toBe(CANARY_URL_A);
    expect(useControlsStore.getState().controls.find(c => c.controlId === controlId)
      .externalUrl).toBe(CANARY_URL_C);
  });

  test('include-private opt-in keeps external URLs and the system name', () => {
    const share = buildShareableExport(stores(), { includePrivate: true });
    const serialized = JSON.stringify(share);
    expect(serialized).toContain(CANARY_URL_F);
    expect(serialized).toContain(CANARY_URL_A);
    expect(serialized).toContain(CANARY_URL_C);
    expect(serialized).toContain(CANARY_SYS);
  });

  test('createFinding and createControl default externalUrl to an empty string', () => {
    const f = useFindingsStore.getState().createFinding({ summary: 'no url' });
    const c = useControlsStore.getState().createControl({ controlId: 'CTL-NOURL-284' });
    expect(f.externalUrl).toBe('');
    expect(c.externalUrl).toBe('');
    useFindingsStore.getState().deleteFinding(f.id);
    useControlsStore.getState().deleteControl(c.controlId);
  });
});
