import {
  subcategoryFromItemId,
  getBankProcedure,
  bankCoverage,
  buildProcedureSource,
  bankSourceUrl,
  BANK_VERSION,
  COMMUNITY_BANK,
  NO_BANK,
  isCommunityBankSource,
  isBankAttached,
  procedureBadge,
  resolvePristine,
  canResetToCommunity,
  resetToCommunityUpdate,
  sourceUrlFor
} from './procedureBank';
import useAssessmentsStore from '../stores/assessmentsStore';

describe('procedureBank helpers', () => {
  test('extracts subcategory from requirement-scope item IDs', () => {
    expect(subcategoryFromItemId('GV.OC-01 Ex1')).toBe('GV.OC-01');
    expect(subcategoryFromItemId('PR.AA-05 Ex12')).toBe('PR.AA-05');
    expect(subcategoryFromItemId('DE.CM-09')).toBe('DE.CM-09');
  });

  test('control-scope and malformed IDs resolve to no coverage', () => {
    expect(subcategoryFromItemId('CTRL-042')).toBeNull();
    expect(subcategoryFromItemId('')).toBeNull();
    expect(subcategoryFromItemId(null)).toBeNull();
    expect(getBankProcedure('CTRL-042')).toBeNull();
  });

  test('bank lookup returns the full markdown with identity', () => {
    const entry = getBankProcedure('GV.OC-01 Ex1');
    expect(entry.bankId).toBe('GV.OC-01');
    expect(entry.markdown).toContain('Test Procedures');
    expect(entry.markdown.length).toBeGreaterThan(200);
    expect(entry.title).toBeTruthy();
  });

  test('coverage splits covered/uncovered preserving order — control scope is honestly zero', () => {
    const { covered, uncovered } = bankCoverage(['GV.OC-01 Ex1', 'CTRL-042', 'PR.AA-01 Ex2', 'ZZ.NOPE-99 Ex1']);
    expect(covered).toEqual(['GV.OC-01 Ex1', 'PR.AA-01 Ex2']);
    expect(uncovered).toEqual(['CTRL-042', 'ZZ.NOPE-99 Ex1']);

    const controlScope = bankCoverage(['CTRL-001', 'CTRL-002']);
    expect(controlScope.covered).toEqual([]);
    expect(controlScope.uncovered).toHaveLength(2);
  });

  test('provenance stamps bank identity, version, and pristine modified flag', () => {
    const src = buildProcedureSource('GV.OC-01');
    expect(src).toMatchObject({
      bank: 'community',
      bankId: 'GV.OC-01',
      bankVersion: BANK_VERSION,
      modified: false
    });
    expect(new Date(src.attachedAt).toString()).not.toBe('Invalid Date');
  });

  test('"Improve this procedure" links to the community source file on GitHub', () => {
    expect(bankSourceUrl('GV.OC-01')).toBe(
      'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/ASSESSMENT_CATALOG/3_Test_Procedures/GV/GV.OC-01.md'
    );
    expect(bankSourceUrl('ZZ.NOPE-99')).toBeNull();
  });
});

describe('bank attach + provenance in the assessments store', () => {
  const store = () => useAssessmentsStore.getState();
  let assessmentId;

  beforeEach(() => {
    const created = store().createAssessment({
      name: 'Bank attach test',
      description: '',
      scopeType: 'requirements'
    });
    assessmentId = created.id;
    store().addToScope(assessmentId, 'GV.OC-01 Ex1');
  });

  afterEach(() => {
    store().deleteAssessment(assessmentId);
  });

  test('attach writes full markdown + pristine provenance (wizard path)', () => {
    const entry = getBankProcedure('GV.OC-01 Ex1');
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown,
      procedureSource: buildProcedureSource(entry.bankId)
    });

    const obs = store().getObservation(assessmentId, 'GV.OC-01 Ex1');
    expect(obs.testProcedures).toBe(entry.markdown);
    expect(obs.procedureSource.bank).toBe('community');
    expect(obs.procedureSource.bankId).toBe('GV.OC-01');
    expect(obs.procedureSource.modified).toBe(false);
  });

  test('hand-editing an attached procedure flips modified — an explicit re-attach resets it', () => {
    const entry = getBankProcedure('GV.OC-01 Ex1');
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown,
      procedureSource: buildProcedureSource(entry.bankId)
    });

    // User edits the text (no procedureSource in the patch — the store flips it)
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown + '\n\nOur org also checks the DR runbook.'
    });
    expect(store().getObservation(assessmentId, 'GV.OC-01 Ex1').procedureSource.modified).toBe(true);

    // Non-text updates never flip the flag
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', { auditorId: 2 });
    expect(store().getObservation(assessmentId, 'GV.OC-01 Ex1').procedureSource.modified).toBe(true);

    // Reset-to-community restores pristine provenance
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', {
      testProcedures: entry.markdown,
      procedureSource: buildProcedureSource(entry.bankId)
    });
    expect(store().getObservation(assessmentId, 'GV.OC-01 Ex1').procedureSource.modified).toBe(false);
  });

  test('observations without provenance are untouched by the modified heuristic', () => {
    store().updateObservation(assessmentId, 'GV.OC-01 Ex1', { testProcedures: 'My own procedure' });
    const obs = store().getObservation(assessmentId, 'GV.OC-01 Ex1');
    expect(obs.testProcedures).toBe('My own procedure');
    expect(obs.procedureSource).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Predicate helpers (PR-1, plan §7 R-6/R-10): provenance checks must be
// positive per-bank matches, total over every source shape — including bank
// values this build does not recognize (records shared from a newer build).
// ---------------------------------------------------------------------------
describe('provenance predicates', () => {
  const community = { bank: COMMUNITY_BANK, bankId: 'GV.OC-01', bankVersion: BANK_VERSION, attachedAt: '2026-07-20T00:00:00.000Z', modified: false };
  const communityModified = { ...community, modified: true };
  const communityTailored = { ...community, tailored: true, modified: true };
  const communityDangling = { ...community, bankId: 'ZZ.NOPE-99' };
  const noneTailored = { bank: NO_BANK, bankId: null, bankVersion: null, attachedAt: '2026-07-20T00:00:00.000Z', tailored: true, modified: true };
  const banklessTailored = { tailored: true, modified: true };
  const futureBank = { bank: 'scuba-gws', bankId: 'gws.commoncontrols.1.1v1', modified: false };
  const futureTailored = { ...futureBank, tailored: true, modified: true };
  // The mutation-killing shapes: bankIds that DO resolve in the community
  // bank, under a foreign or absent bank label. A bank-blind resolver
  // happily (and wrongly) resolves these — the predicates must not.
  const foreignWithCommunityId = { bank: 'scuba-gws', bankId: 'GV.OC-01', tailored: true, modified: true };
  const banklessWithCommunityId = { bankId: 'GV.OC-01', tailored: true, modified: true };

  test('isCommunityBankSource matches only the community bank', () => {
    expect(isCommunityBankSource(community)).toBe(true);
    expect(isCommunityBankSource(communityTailored)).toBe(true);
    expect(isCommunityBankSource(noneTailored)).toBe(false);
    expect(isCommunityBankSource(banklessTailored)).toBe(false);
    expect(isCommunityBankSource(futureBank)).toBe(false);
    expect(isCommunityBankSource(null)).toBe(false);
    expect(isCommunityBankSource(undefined)).toBe(false);
  });

  test('isBankAttached counts community AND unrecognized banks, never the no-bank marker', () => {
    expect(isBankAttached(community)).toBe(true);
    expect(isBankAttached(futureBank)).toBe(true);
    expect(isBankAttached(noneTailored)).toBe(false);
    expect(isBankAttached(banklessTailored)).toBe(false);
    expect(isBankAttached(null)).toBe(false);
  });

  test('procedureBadge labels community sources, pristine and customized', () => {
    expect(procedureBadge(null)).toBeNull();
    expect(procedureBadge(undefined)).toBeNull();
    expect(procedureBadge(community)).toEqual({ kind: 'community', label: 'Community' });
    expect(procedureBadge(communityModified)).toEqual({ kind: 'community', label: 'Community · customized' });
    expect(procedureBadge(communityTailored)).toEqual({ kind: 'community', label: 'Community · customized' });
  });

  test('procedureBadge labels no-bank tailored text as org-tailored', () => {
    expect(procedureBadge(noneTailored)).toEqual({ kind: 'tailored', label: 'Tailored to your org' });
    expect(procedureBadge(banklessTailored)).toEqual({ kind: 'tailored', label: 'Tailored to your org' });
    expect(procedureBadge({ bank: NO_BANK, tailored: false })).toBeNull();
  });

  test('an unrecognized bank value gets a VISIBLE descriptor naming the bank — never null', () => {
    expect(procedureBadge(futureBank)).toEqual({ kind: 'bank', label: 'scuba-gws' });
    expect(procedureBadge({ ...futureBank, modified: true })).toEqual({ kind: 'bank', label: 'scuba-gws · customized' });
  });

  test('a tailored unrecognized-bank source shows its bank, NOT the org-tailor label', () => {
    expect(procedureBadge(futureTailored)).toEqual({ kind: 'bank', label: 'scuba-gws · customized' });
  });

  test('resolvePristine restores the community entry byte-identically', () => {
    const pristine = resolvePristine(communityTailored);
    expect(pristine.bankId).toBe('GV.OC-01');
    expect(pristine.markdown).toBe(getBankProcedure('GV.OC-01').markdown);
  });

  test('resolvePristine is a positive match — everything else resolves to null', () => {
    expect(resolvePristine(null)).toBeNull();
    expect(resolvePristine(undefined)).toBeNull();
    expect(resolvePristine(noneTailored)).toBeNull();
    expect(resolvePristine(banklessTailored)).toBeNull();
    expect(resolvePristine(futureBank)).toBeNull();
    expect(resolvePristine(futureTailored)).toBeNull();
    expect(resolvePristine(communityDangling)).toBeNull();
  });

  test('resolvePristine refuses resolvable bankIds under a foreign or absent bank label (bank-blind mutant killer)', () => {
    // Precondition making these discriminating: the bankId itself resolves.
    expect(getBankProcedure('GV.OC-01')).not.toBeNull();
    expect(resolvePristine(foreignWithCommunityId)).toBeNull();
    expect(resolvePristine(banklessWithCommunityId)).toBeNull();
  });

  test('canResetToCommunity permits hand-written, community, and no-bank text only', () => {
    expect(canResetToCommunity(undefined)).toBe(true);
    expect(canResetToCommunity(null)).toBe(true);
    expect(canResetToCommunity(community)).toBe(true);
    expect(canResetToCommunity(communityTailored)).toBe(true);
    expect(canResetToCommunity(noneTailored)).toBe(true);
    expect(canResetToCommunity(banklessTailored)).toBe(true);
    expect(canResetToCommunity(futureBank)).toBe(false);
    expect(canResetToCommunity(futureTailored)).toBe(false);
  });

  test('sourceUrlFor resolves community sources only, from OUR bank data', () => {
    expect(sourceUrlFor(community)).toBe(bankSourceUrl('GV.OC-01'));
    expect(sourceUrlFor(communityDangling)).toBeNull();
    expect(sourceUrlFor(noneTailored)).toBeNull();
    expect(sourceUrlFor(futureBank)).toBeNull();
    expect(sourceUrlFor(null)).toBeNull();
  });

  test('sourceUrlFor refuses a resolvable bankId under a foreign label — no community URL on foreign content', () => {
    expect(sourceUrlFor(foreignWithCommunityId)).toBeNull();
    expect(sourceUrlFor(banklessWithCommunityId)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resetToCommunityUpdate — the production decision behind the detail panel's
// Insert / Reset-to-community button (the page is a dumb dispatcher).
// ---------------------------------------------------------------------------
describe('resetToCommunityUpdate producer', () => {
  const foreign = { bank: 'scuba-gws', bankId: 'GV.OC-01', tailored: true, modified: true };

  test('hand-written text (no source) gets the pristine community attach', () => {
    const update = resetToCommunityUpdate('GV.OC-01 Ex1', undefined);
    expect(update.testProcedures).toBe(getBankProcedure('GV.OC-01').markdown);
    expect(update.procedureSource).toMatchObject({ bank: COMMUNITY_BANK, bankId: 'GV.OC-01', modified: false });
  });

  test('community and no-bank sources may be reset (today\'s exact behavior)', () => {
    const communitySrc = buildProcedureSource('GV.OC-01');
    expect(resetToCommunityUpdate('GV.OC-01 Ex1', { ...communitySrc, tailored: true, modified: true })).not.toBeNull();
    expect(resetToCommunityUpdate('GV.OC-01 Ex1', { bank: NO_BANK, bankId: null, tailored: true })).not.toBeNull();
  });

  test('refuses to overwrite another bank\'s content — even with a resolvable community bankId', () => {
    expect(resetToCommunityUpdate('GV.OC-01 Ex1', foreign)).toBeNull();
  });

  test('uncovered items produce no update', () => {
    expect(resetToCommunityUpdate('CTRL-042', undefined)).toBeNull();
  });
});
