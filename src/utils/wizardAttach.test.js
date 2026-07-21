/**
 * wizardAttachObservation — the wizard's single attach producer (plan PR-6)
 * — plus the source-scan pins that keep the page a dispatcher.
 *
 * Branch semantics (advisor ruling, G24): offers → the PR-5 composed attach,
 * byte-exact; zero offers → the plain community attach, deepEqual to what
 * the wizard produced before the Environment step existed. An assessment
 * that attaches no platform checks gains NO new keys — not even a
 * trunk-only recipe.
 */
import fs from 'fs';
import path from 'path';
import {
  bankAttachObservation,
  composeAttachObservation,
  wizardAttachObservation
} from './procedureTailor';
import { getBankProcedure } from './procedureBank';
import { getPlatformProcedures } from './platformBank';

const trunkEntry = getBankProcedure('PR.AA-05');
const offers = getPlatformProcedures('PR.AA-05', ['google-workspace']);

// attachedAt is a wall-clock stamp; two producer calls can straddle a
// millisecond boundary, so every producer-identity comparison neutralizes it.
const neutralize = (o) => JSON.stringify({
  ...o,
  procedureSource: { ...o.procedureSource, attachedAt: 'T' }
});

describe('wizardAttachObservation branch polarity', () => {
  test('offers present: output === composeAttachObservation, byte-exact (attach timestamp neutralized)', () => {
    const viaWizard = wizardAttachObservation(trunkEntry, offers, null, {});
    const direct = composeAttachObservation(trunkEntry, offers, null, {});
    // attachedAt is a wall-clock stamp; the two calls are milliseconds apart.
    // Everything else must be byte-exact.
    expect(typeof viaWizard.procedureSource.attachedAt).toBe('string');
    expect(neutralize(viaWizard)).toBe(neutralize(direct));
    expect(viaWizard.platformProcedures).toHaveLength(offers.length);
  });

  test('zero offers: output deepEqual to bankAttachObservation — no platformProcedures, no components key', () => {
    const viaWizard = wizardAttachObservation(trunkEntry, [], null, {});
    const legacy = bankAttachObservation(trunkEntry, null, {});
    expect(neutralize(viaWizard)).toBe(neutralize(legacy));
    expect('platformProcedures' in viaWizard).toBe(false);
    expect('components' in viaWizard.procedureSource).toBe(false);
  });

  test('undefined offers behave as zero (items outside the attach plan)', () => {
    const viaWizard = wizardAttachObservation(trunkEntry, undefined, null, {});
    expect(neutralize(viaWizard)).toBe(neutralize(bankAttachObservation(trunkEntry, null, {})));
  });

  test('tailoring options thread through both branches', () => {
    const profile = { orgName: 'Wizard Test Org' };
    const opts = { substituteName: true };
    expect(wizardAttachObservation(trunkEntry, offers, profile, opts).testProcedures).toBe(
      composeAttachObservation(trunkEntry, offers, profile, opts).testProcedures
    );
    expect(wizardAttachObservation(trunkEntry, [], profile, opts).testProcedures).toBe(
      bankAttachObservation(trunkEntry, profile, opts).testProcedures
    );
  });

  test('hand-built refs cannot substitute for compose output (decorrelation)', () => {
    // A mutant page that splices its own ref objects produces refs that
    // diverge from compose's canonical shape the moment any field drifts.
    const viaWizard = wizardAttachObservation(trunkEntry, offers.slice(0, 2), null, {});
    const handBuilt = offers.slice(0, 2).map((o) => ({
      corpusId: o.corpusId,
      policyId: o.policyId
      // missing corpusVersion + contentHash — the drift a hand-builder ships
    }));
    expect(viaWizard.platformProcedures).not.toEqual(handBuilt);
    viaWizard.platformProcedures.forEach((ref) => {
      expect(Object.keys(ref).sort()).toEqual([
        'contentHash', 'corpusId', 'corpusVersion', 'policyId'
      ]);
    });
  });
});

describe('page-dispatcher source pins (plan PR-6)', () => {
  const SRC = path.join(process.cwd(), 'src');
  const stripComments = (code) =>
    code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const page = stripComments(
    fs.readFileSync(path.join(SRC, 'pages/Assessments.js'), 'utf8')
  );

  test('exactly one attach-producer call in the create path: wizardAttachObservation', () => {
    expect((page.match(/wizardAttachObservation\(/g) || []).length).toBe(1);
    // compose is never called from the page directly (the wrapper owns the branch)
    expect((page.match(/composeAttachObservation\(/g) || []).length).toBe(0);
    // bankAttachObservation remains ONLY as the step-3 preview producer
    expect((page.match(/bankAttachObservation\(/g) || []).length).toBe(1);
  });

  test('no wizard module writes the org profile (ratified no-write-back)', () => {
    // The org profile's only write APIs are saveProfile / setCloudConsent /
    // clearProfile / setProfileState. The assessment wizard page and the
    // Environment helpers must never call any of them; seeding is a pure read.
    const WRITE_TOKENS = /saveProfile\s*\(|setCloudConsent\s*\(|clearProfile\s*\(|setProfileState\s*\(/;
    expect(WRITE_TOKENS.test(page)).toBe(false);
    ['utils/environmentStep.js', 'utils/infraPresets.js'].forEach((rel) => {
      const code = stripComments(fs.readFileSync(path.join(SRC, rel), 'utf8'));
      expect(WRITE_TOKENS.test(code)).toBe(false);
      // Belt and braces: the helpers never even import the profile store.
      expect(code).not.toMatch(/orgProfileStore/);
    });
  });
});

describe('org profile store state is byte-untouched by Environment step logic', () => {
  test('running seed + matrix + plan against a hydrated store leaves its state identical', () => {
    /* eslint-disable global-require */
    const useOrgProfileStore = require('../stores/orgProfileStore').default;
    const { platformIdsFromInfrastructure } = require('./infraPresets');
    const { buildEnvironmentMatrix, buildAttachPlan, cellKey } = require('./environmentStep');
    /* eslint-enable global-require */
    useOrgProfileStore.getState().saveProfile({
      orgName: 'Untouched Org',
      infrastructure: ['Google Workspace', 'AWS']
    });
    const before = JSON.stringify(useOrgProfileStore.getState());
    const seeded = platformIdsFromInfrastructure(
      useOrgProfileStore.getState().profile.infrastructure
    );
    expect(seeded).toEqual(['google-workspace']);
    buildEnvironmentMatrix(['PR.AA-05'], seeded);
    buildAttachPlan(['PR.AA-05'], { [cellKey('PR.AA-05', 'google-workspace')]: true }, seeded, true);
    const after = JSON.stringify(useOrgProfileStore.getState());
    expect(after).toBe(before);
  });
});
