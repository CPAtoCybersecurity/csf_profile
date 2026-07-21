/**
 * composeAttachObservation (plan §7 R-3/R-6; PR-5): trunk + platform
 * REFERENCES + the recorded composition recipe. The addendum text must never
 * be copied into the observation — that is the whole point of the reference
 * model under measured reverse cardinality (122 policies on PR.DS-10).
 */
import bank from '../data/platformProcedures.json';
import { bankAttachObservation, composeAttachObservation } from './procedureTailor';
import { getBankProcedure, BANK_VERSION, COMMUNITY_BANK } from './procedureBank';
import { getPlatformProcedures, PLATFORM_CORPUS_ID } from './platformBank';

const trunkEntry = getBankProcedure('PR.AA-05');
const offers = () => getPlatformProcedures('PR.AA-05', ['google-workspace']).slice(0, 3);

describe('composeAttachObservation', () => {
  test('writes references + recipe, never copied upstream text (byte-check on testProcedures)', () => {
    const sample = offers();
    expect(sample.length).toBe(3);
    const composed = composeAttachObservation(trunkEntry, sample);
    // trunk text is exactly the community attach — no addendum text baked in
    expect(composed.testProcedures).toBe(bankAttachObservation(trunkEntry).testProcedures);
    sample.forEach((offer) => {
      expect(composed.testProcedures).not.toContain(offer.record.assertion);
      expect(composed.testProcedures).not.toContain(offer.record.instructions);
    });
    // refs are the R-3 shape, exactly — no text field anywhere
    expect(composed.platformProcedures).toHaveLength(3);
    composed.platformProcedures.forEach((ref, i) => {
      expect(Object.keys(ref).sort()).toEqual([
        'contentHash',
        'corpusId',
        'corpusVersion',
        'policyId'
      ]);
      expect(ref.corpusId).toBe(PLATFORM_CORPUS_ID);
      expect(ref.corpusVersion).toBe(bank.bankVersion);
      expect(ref.policyId).toBe(sample[i].policyId);
    });
  });

  test('records the composition recipe in procedureSource.components at attach', () => {
    const sample = offers();
    const composed = composeAttachObservation(trunkEntry, sample);
    const components = composed.procedureSource.components;
    expect(components).toHaveLength(4); // trunk + 3 addenda
    expect(components[0]).toEqual({
      kind: 'trunk',
      bank: COMMUNITY_BANK,
      bankId: 'PR.AA-05',
      bankVersion: BANK_VERSION
    });
    components.slice(1).forEach((c, i) => {
      expect(c.kind).toBe('platform-ref');
      expect(c.policyId).toBe(composed.platformProcedures[i].policyId);
      expect(c.contentHash).toBe(composed.platformProcedures[i].contentHash);
      expect(c.corpusId).toBe(PLATFORM_CORPUS_ID);
      expect(c.corpusVersion).toBe(bank.bankVersion);
    });
    // the rest of the provenance object is the community attach, untouched
    expect(composed.procedureSource.bank).toBe(COMMUNITY_BANK);
    expect(composed.procedureSource.bankId).toBe('PR.AA-05');
    expect(composed.procedureSource.tailored).toBe(false);
    expect(composed.procedureSource.modified).toBe(false);
  });

  test('zero offers: trunk byte-identical to bankAttachObservation, trunk-only recipe, no platformProcedures key', () => {
    const composed = composeAttachObservation(trunkEntry, []);
    const plain = bankAttachObservation(trunkEntry);
    expect(composed.testProcedures).toBe(plain.testProcedures);
    expect('platformProcedures' in composed).toBe(false);
    expect(composed.procedureSource.components).toEqual([
      { kind: 'trunk', bank: COMMUNITY_BANK, bankId: 'PR.AA-05', bankVersion: BANK_VERSION }
    ]);
    // recipe aside, provenance matches the plain attach field-for-field
    const composedRest = { ...composed.procedureSource };
    delete composedRest.components;
    delete composedRest.attachedAt;
    const plainRest = { ...plain.procedureSource };
    delete plainRest.attachedAt;
    expect(composedRest).toEqual(plainRest);
  });

  test('tailoring options apply to the TRUNK only — addendum refs are identical either way', () => {
    const sample = offers();
    const profile = { orgName: 'Compose Test Org' };
    const tailored = composeAttachObservation(trunkEntry, sample, profile, {
      substituteName: true
    });
    const plain = composeAttachObservation(trunkEntry, sample);
    expect(tailored.platformProcedures).toEqual(plain.platformProcedures);
    expect(tailored.procedureSource.components.slice(1)).toEqual(
      plain.procedureSource.components.slice(1)
    );
  });
});
