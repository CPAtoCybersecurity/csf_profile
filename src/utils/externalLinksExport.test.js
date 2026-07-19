/**
 * External-URL share-export guards (issues #284/#288, PRIVATE_DATA.md).
 *
 * Ticket/document URLs and system names reveal internal infrastructure
 * (Jira/ServiceNow hosts, SharePoint sites, project keys, tooling choices).
 * Default share exports scrub:
 *   - findings.externalUrl
 *   - artifacts.link          (pre-existing field — deliberate behavior change)
 *   - controls.externalUrl
 *   - assessments.externalTracking.systems.{findings,artifacts,controls}
 *   - every observation's externalLinks list (issue #288)
 * The include-private opt-in keeps them; complete backups always keep them;
 * the scrub is copy-on-write and never mutates live store records. The
 * externalTracking scrub REBUILDS the object (never spreads), so legacy
 * fields on unmigrated records cannot ride out — pinned here by a canary
 * seeded PAST the normalizing producers via the bulk setter.
 */
import { exportAllDataJSON, buildShareableExport } from './dataExport';
import useAssessmentsStore from '../stores/assessmentsStore';
import useFindingsStore from '../stores/findingsStore';
import useArtifactStore from '../stores/artifactStore';
import useControlsStore from '../stores/controlsStore';

const CANARY_SYS_F = 'CanaryJira GRC';
const CANARY_SYS_A = 'CanarySharePoint GRC';
const CANARY_SYS_C = 'CanaryHyperproof GRC';
const CANARY_URL_F = 'https://jira.internal-canary.example/browse/SEC-9999';
const CANARY_URL_A = 'https://sharepoint.internal-canary.example/sites/evidence/AR-77';
const CANARY_URL_C = 'https://grc.internal-canary.example/controls/CTL-042';
const CANARY_URL_OBS = 'https://jira.internal-canary.example/browse/OBS-1234';
const OBS_ITEM = 'GV.OC-01 Ex1';

const stores = () => ({
  assessmentsStore: useAssessmentsStore,
  findingsStore: useFindingsStore,
  artifactStore: useArtifactStore,
  controlsStore: useControlsStore
});

describe('external URLs in exports (issues #284/#288)', () => {
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
        systems: { findings: CANARY_SYS_F, artifacts: CANARY_SYS_A, controls: CANARY_SYS_C }
      }
    });
    assessmentId = assessment.id;

    useAssessmentsStore.getState().updateObservation(assessmentId, OBS_ITEM, {
      externalLinks: [{ type: 'findings', url: CANARY_URL_OBS }]
    });

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

  test('createAssessment persists the wizard per-type externalTracking choice', () => {
    const stored = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
    expect(stored.externalTracking).toEqual({
      enabled: true,
      systems: { findings: CANARY_SYS_F, artifacts: CANARY_SYS_A, controls: CANARY_SYS_C }
    });
  });

  test('updateObservation normalizes links at the producer — junk cannot persist', () => {
    useAssessmentsStore.getState().updateObservation(assessmentId, OBS_ITEM, {
      externalLinks: [
        { type: 'findings', url: `  ${CANARY_URL_OBS}  ` },
        { type: 'bogus', url: 'https://x.example' },
        { type: 'findings' }
      ]
    });
    const stored = useAssessmentsStore.getState().getObservation(assessmentId, OBS_ITEM);
    expect(stored.externalLinks).toHaveLength(1);
    expect(stored.externalLinks[0]).toEqual(
      expect.objectContaining({ type: 'findings', url: CANARY_URL_OBS })
    );
    expect(stored.externalLinks[0].id).toBeTruthy();
  });

  test('an observation never touched by the feature reads back an empty links list', () => {
    const untouched = useAssessmentsStore.getState().getObservation(assessmentId, 'ID.AM-01 Ex1');
    expect(untouched.externalLinks).toEqual([]);
  });

  test('complete backup keeps every external URL and all three system names — that is its job', () => {
    const backup = exportAllDataJSON(stores());
    const serialized = JSON.stringify(backup);
    expect(serialized).toContain(CANARY_URL_F);
    expect(serialized).toContain(CANARY_URL_A);
    expect(serialized).toContain(CANARY_URL_C);
    expect(serialized).toContain(CANARY_URL_OBS);
    expect(serialized).toContain(CANARY_SYS_F);
    expect(serialized).toContain(CANARY_SYS_A);
    expect(serialized).toContain(CANARY_SYS_C);
  });

  test('default share export scrubs every URL, link list, and system name — whole-envelope assert', () => {
    const share = buildShareableExport(stores());
    const serialized = JSON.stringify(share);

    expect(serialized).not.toContain(CANARY_URL_F);
    expect(serialized).not.toContain(CANARY_URL_A);
    expect(serialized).not.toContain(CANARY_URL_C);
    expect(serialized).not.toContain(CANARY_URL_OBS);
    expect(serialized).not.toContain(CANARY_SYS_F);
    expect(serialized).not.toContain(CANARY_SYS_A);
    expect(serialized).not.toContain(CANARY_SYS_C);
    expect(serialized).not.toContain('internal-canary.example');

    // Shape preserved: the fields exist but are blank; the enabled flag
    // (non-sensitive boolean) survives.
    const assessment = share.data.assessments.find(a => a.id === assessmentId);
    expect(assessment.externalTracking).toEqual({
      enabled: true,
      systems: { findings: '', artifacts: '', controls: '' }
    });
    expect(assessment.observations[OBS_ITEM].externalLinks).toEqual([]);
    expect(share.data.findings.find(f => f.id === findingId).externalUrl).toBe('');
    expect(share.data.artifacts.find(a => a.id === artifactId).link).toBe('');
    expect(share.data.controls.find(c => c.controlId === controlId).externalUrl).toBe('');
  });

  test('a legacy record seeded PAST the normalizing producers still cannot leak (rebuild, not spread)', () => {
    const legacy = {
      id: 'ASM-legacy-canary',
      name: 'Unmigrated import',
      scopeType: 'requirements',
      scopeIds: [],
      externalTracking: { enabled: true, systemName: 'LegacySysCanary' },
      observations: {
        [OBS_ITEM]: {
          externalLinks: [{ id: 'XL-legacy', type: 'findings', url: 'https://legacy.internal-canary.example/x' }],
          quarters: {}
        },
        // Tampered NON-ARRAY shape: the scrub must be shape-agnostic — any
        // present externalLinks value is emptied, not just well-formed arrays.
        'ID.AM-01 Ex1': {
          externalLinks: { url: 'https://tamper.internal-canary.example/y' },
          quarters: {}
        }
      }
    };
    const { setAssessments, assessments } = useAssessmentsStore.getState();
    setAssessments([...assessments, legacy]);
    try {
      const serialized = JSON.stringify(buildShareableExport(stores()));
      expect(serialized).not.toContain('LegacySysCanary');
      expect(serialized).not.toContain('legacy.internal-canary.example');
      expect(serialized).not.toContain('tamper.internal-canary.example');
    } finally {
      useAssessmentsStore.getState().deleteAssessment('ASM-legacy-canary');
    }
  });

  test('the scrub is copy-on-write — live store records are never mutated', () => {
    buildShareableExport(stores());

    const liveAssessment = useAssessmentsStore.getState().assessments.find(a => a.id === assessmentId);
    expect(liveAssessment.externalTracking.systems).toEqual({
      findings: CANARY_SYS_F, artifacts: CANARY_SYS_A, controls: CANARY_SYS_C
    });
    expect(liveAssessment.observations[OBS_ITEM].externalLinks[0].url).toBe(CANARY_URL_OBS);
    expect(useFindingsStore.getState().findings.find(f => f.id === findingId)
      .externalUrl).toBe(CANARY_URL_F);
    expect(useArtifactStore.getState().artifacts.find(a => a.id === artifactId)
      .link).toBe(CANARY_URL_A);
    expect(useControlsStore.getState().controls.find(c => c.controlId === controlId)
      .externalUrl).toBe(CANARY_URL_C);
  });

  test('include-private opt-in keeps external URLs, link lists, and system names', () => {
    const share = buildShareableExport(stores(), { includePrivate: true });
    const serialized = JSON.stringify(share);
    expect(serialized).toContain(CANARY_URL_F);
    expect(serialized).toContain(CANARY_URL_A);
    expect(serialized).toContain(CANARY_URL_C);
    expect(serialized).toContain(CANARY_URL_OBS);
    expect(serialized).toContain(CANARY_SYS_F);
    expect(serialized).toContain(CANARY_SYS_A);
    expect(serialized).toContain(CANARY_SYS_C);
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
