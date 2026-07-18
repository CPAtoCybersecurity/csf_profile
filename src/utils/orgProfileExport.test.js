/**
 * Org-profile privacy guards (PRIVATE_DATA.md):
 *  - the profile object NEVER rides share exports (opt-in or not);
 *  - the DERIVED leak path is closed: tailored procedure text (org name,
 *    crown-jewel references baked in) is swapped back to the pristine
 *    community version in default share exports;
 *  - complete backups DO carry the profile (that's their job);
 *  - restore round-trips it, older files skip it, cloud consent gates it.
 */
import { exportAllDataJSON, buildShareableExport, EXPORT_FORMAT_VERSION } from './dataExport';
import { validateDatabaseExport, importCompleteDatabase } from './dataImport';
import { tailorMarkdown, canUseProfileWithProvider, tailoredProvenance, bankAttachObservation } from './procedureTailor';
import { getBankProcedure, buildProcedureSource } from './procedureBank';
import useOrgProfileStore from '../stores/orgProfileStore';
import useAssessmentsStore from '../stores/assessmentsStore';

const CANARY_JEWEL = 'CustomerVault9000';
const CANARY_ORG = 'Northwind Insurance';

const seedProfile = () => {
  useOrgProfileStore.getState().saveProfile({
    orgName: CANARY_ORG,
    industry: 'Insurance',
    sizeBand: '250–999',
    infrastructure: ['AWS'],
    securityTools: ['EDR'],
    crownJewels: [CANARY_JEWEL]
  });
};

const stores = () => ({
  assessmentsStore: useAssessmentsStore,
  orgProfileStore: useOrgProfileStore
});

describe('org profile in exports', () => {
  let assessmentId;
  const pristine = getBankProcedure('GV.OC-01').markdown;

  beforeEach(() => {
    seedProfile();
    const created = useAssessmentsStore.getState().createAssessment({
      name: 'Tailored export test',
      description: '',
      scopeType: 'requirements'
    });
    assessmentId = created.id;
    useAssessmentsStore.getState().addToScope(assessmentId, 'GV.OC-01 Ex1');

    // A tailored attach: profile facts baked into the observation text
    const { text, tailored } = tailorMarkdown(
      `${pristine}\n\nCrown-jewel focus: verify ${CANARY_JEWEL} recovery steps.`,
      useOrgProfileStore.getState().profile
    );
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: text,
      procedureSource: { ...buildProcedureSource('GV.OC-01'), tailored: tailored || true }
    });
  });

  afterEach(() => {
    useAssessmentsStore.getState().deleteAssessment(assessmentId);
    useOrgProfileStore.getState().clearProfile();
  });

  test('complete backup carries the profile — that is its job', () => {
    const backup = exportAllDataJSON(stores());
    expect(backup.formatVersion).toBe(EXPORT_FORMAT_VERSION);
    expect(backup.data.orgProfile.profile.crownJewels).toContain(CANARY_JEWEL);
    // Tailored text stays in the user's own backup
    expect(JSON.stringify(backup.data.assessments)).toContain(CANARY_JEWEL);
  });

  test('default share export: no profile object AND no derived leak — tailored text swapped to pristine', () => {
    const share = buildShareableExport(stores());
    const serialized = JSON.stringify(share);

    expect(share.data.orgProfile).toBeUndefined();
    expect(serialized).not.toContain(CANARY_JEWEL);
    expect(serialized).not.toContain(CANARY_ORG);

    const exported = share.data.assessments.find((a) => a.id === assessmentId);
    const obs = exported.observations['GV.OC-01 Ex1'];
    expect(obs.testProcedures).toBe(pristine);
    expect(obs.procedureSource.tailored).toBe(false);

    // Store objects were never mutated (copy-on-write)
    const inStore = useAssessmentsStore.getState()
      .getObservation(assessmentId, 'GV.OC-01 Ex1');
    expect(inStore.testProcedures).toContain(CANARY_JEWEL);
    expect(inStore.procedureSource.tailored).toBe(true);
  });

  test('include-private opt-in keeps tailored text but STILL never the profile object', () => {
    const share = buildShareableExport(stores(), { includePrivate: true });
    expect(share.data.orgProfile).toBeUndefined();
    expect(JSON.stringify(share.data.assessments)).toContain(CANARY_JEWEL);
  });

  test('AI-tailoring an observation with NO prior provenance still swaps in default share (bank-covered item)', () => {
    // The reviewer-caught hole: tailored output must ALWAYS carry tailored
    // provenance, or the swap never fires. Simulates handleTailorWithAI on a
    // hand-written procedure for a bank-covered item.
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: 'My own procedure — no provenance yet.',
      procedureSource: undefined
    });
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: `Tailored for ${CANARY_ORG}: protect ${CANARY_JEWEL}.`,
      procedureSource: tailoredProvenance(undefined, 'GV.OC-01 Ex1')
    });

    const share = buildShareableExport(stores());
    const obs = share.data.assessments.find((a) => a.id === assessmentId).observations['GV.OC-01 Ex1'];
    expect(obs.testProcedures).toBe(pristine);
    expect(JSON.stringify(share)).not.toContain(CANARY_JEWEL);
  });

  test('AI-tailoring an item with no bank coverage (control scope) drops the text in default share', () => {
    useAssessmentsStore.getState().addToScope(assessmentId, 'CTRL-042');
    useAssessmentsStore.getState().updateObservation(assessmentId, 'CTRL-042', {
      testProcedures: `Tailored control steps referencing ${CANARY_JEWEL}.`,
      procedureSource: tailoredProvenance(undefined, 'CTRL-042')
    });

    const share = buildShareableExport(stores());
    const obs = share.data.assessments.find((a) => a.id === assessmentId).observations['CTRL-042'];
    expect(obs.testProcedures).toBe('');
    expect(JSON.stringify(share)).not.toContain(CANARY_JEWEL);
  });

  test('stack-swap producer: deterministic tool substitutions never leak into default share', () => {
    // The G8.1 producer path — canned stack swaps reveal profile facts
    // (their cloud, their EDR vendor) just like AI tailoring does, so the
    // pristine swap must cover it identically.
    const stackProfile = {
      orgName: CANARY_ORG,
      infrastructure: ['Google Cloud'],
      securityTools: ['CrowdStrike']
    };
    useOrgProfileStore.getState().saveProfile(stackProfile);
    // Exercise the REAL wizard-attach producer, not a simulation of it —
    // if it ever stops stamping tailored provenance, this test fails.
    const produced = bankAttachObservation(getBankProcedure('GV.OC-01'), stackProfile, { substituteName: true, adaptStack: true });
    expect(produced.procedureSource.tailored).toBe(true);
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', produced);

    const share = buildShareableExport(stores());
    const serialized = JSON.stringify(share);
    const obs = share.data.assessments.find((a) => a.id === assessmentId).observations['GV.OC-01 Ex1'];
    expect(obs.testProcedures).toBe(pristine);
    expect(serialized).not.toContain('CrowdStrike');
    expect(serialized).not.toContain(CANARY_ORG);
  });

  test('a tailored observation whose bank entry cannot resolve exports empty text, never the tailored text', () => {
    useAssessmentsStore.getState().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: `Secret steps for ${CANARY_JEWEL}`,
      procedureSource: { bank: 'community', bankId: 'ZZ.GONE-99', bankVersion: 'x', tailored: true }
    });
    const share = buildShareableExport(stores());
    const obs = share.data.assessments.find((a) => a.id === assessmentId).observations['GV.OC-01 Ex1'];
    expect(obs.testProcedures).toBe('');
    expect(JSON.stringify(share)).not.toContain(CANARY_JEWEL);
  });
});

describe('org profile restore path', () => {
  const stubArrayStores = () => {
    const mk = (stateKey, setterName) => {
      const state = { [stateKey]: [], [setterName]: jest.fn() };
      return { getState: () => state };
    };
    return {
      userStore: mk('users', 'setUsers'),
      controlsStore: mk('controls', 'setControls'),
      assessmentsStore: mk('assessments', 'setAssessments'),
      requirementsStore: mk('requirements', 'setRequirements'),
      frameworksStore: mk('frameworks', 'setFrameworks'),
      artifactStore: mk('artifacts', 'setArtifacts'),
      findingsStore: mk('findings', 'setFindings'),
      metricsStore: mk('metrics', 'setMetrics'),
      orgProfileStore: useOrgProfileStore
    };
  };

  const envelope = (extra = {}) => ({
    formatVersion: EXPORT_FORMAT_VERSION,
    data: {
      frameworks: [{ id: 'csf2', name: 'CSF 2.0' }],
      assessments: [],
      ...extra
    }
  });

  afterEach(() => {
    useOrgProfileStore.getState().clearProfile();
  });

  test('format-4 restore round-trips the profile', () => {
    const file = envelope({
      orgProfile: { profile: { orgName: 'Restored Org', crownJewels: ['DB1'] }, cloudConsent: true }
    });
    expect(validateDatabaseExport(file).ok).toBe(true);
    const result = importCompleteDatabase(file, stubArrayStores(), { backupFirst: false });
    expect(result.applied).toContain('orgProfile');
    expect(useOrgProfileStore.getState().profile.orgName).toBe('Restored Org');
    expect(useOrgProfileStore.getState().cloudConsent).toBe(true);
  });

  test('format-3 files (no orgProfile section) skip the profile — existing profile untouched', () => {
    useOrgProfileStore.getState().saveProfile({ orgName: 'Keep Me' });
    const file = { ...envelope(), formatVersion: 3 };
    const result = importCompleteDatabase(file, stubArrayStores(), { backupFirst: false });
    expect(result.skipped).toContain('orgProfile');
    expect(useOrgProfileStore.getState().profile.orgName).toBe('Keep Me');
  });

  test('malformed orgProfile section is rejected', () => {
    const file = envelope({ orgProfile: ['not', 'an', 'object'] });
    const validation = validateDatabaseExport(file);
    expect(validation.ok).toBe(false);
    expect(validation.errors.join(' ')).toContain('orgProfile');
  });
});

describe('tailoredProvenance — always tailored, never undefined', () => {
  test('existing source: flags stamped, identity preserved', () => {
    const src = tailoredProvenance(
      { bank: 'community', bankId: 'GV.OC-01', bankVersion: 'abc', modified: false },
      'GV.OC-01 Ex1'
    );
    expect(src).toMatchObject({ bank: 'community', bankId: 'GV.OC-01', tailored: true, modified: true });
  });

  test('no source + bank-covered item: synthesizes resolvable community provenance', () => {
    const src = tailoredProvenance(undefined, 'PR.AA-01 Ex2');
    expect(src.bank).toBe('community');
    expect(src.bankId).toBe('PR.AA-01');
    expect(src.tailored).toBe(true);
  });

  test('no source + no bank coverage: bank:"none" marker, still tailored', () => {
    const src = tailoredProvenance(undefined, 'CTRL-042');
    expect(src.bank).toBe('none');
    expect(src.bankId).toBeNull();
    expect(src.tailored).toBe(true);
  });
});

describe('cloud consent gate', () => {
  test('local Ollama needs no consent; cloud Claude requires the explicit opt-in', () => {
    expect(canUseProfileWithProvider('ollama', false)).toBe(true);
    expect(canUseProfileWithProvider('claude', false)).toBe(false);
    expect(canUseProfileWithProvider('claude', true)).toBe(true);
  });
});

describe('deterministic tailoring', () => {
  test('substitutes the org name for Alma Security and flags the result tailored', () => {
    const { text, tailored } = tailorMarkdown(
      "Review Alma Security's mission. Confirm Alma leadership sign-off.",
      { orgName: CANARY_ORG }
    );
    expect(tailored).toBe(true);
    expect(text).toContain(CANARY_ORG);
    expect(text).not.toMatch(/\bAlma\b/);
  });

  test('no org name → text unchanged, not tailored', () => {
    const { text, tailored } = tailorMarkdown('Review Alma Security policy.', { orgName: '  ' });
    expect(tailored).toBe(false);
    expect(text).toBe('Review Alma Security policy.');
  });
});
