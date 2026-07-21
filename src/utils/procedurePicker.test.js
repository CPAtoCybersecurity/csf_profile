/**
 * Post-create platform-check picker producer (plan PR-7) — the writer that
 * closes PR-6's one-way door. Every assertion executes the PRODUCTION
 * producer (pickerObservationUpdate) and, where composition round-trips
 * matter, chains the PRODUCTION Reset producer (resetToCommunityUpdate) —
 * never a re-implementation (standing doctrine, G19).
 *
 * Ratification anti-tests live here:
 *  - adopt is the ONLY operation that rewrites a stored contentHash; no
 *    rebuild touches an entry it did not target (per-ref guard on a
 *    fixture with two drifted neighbors);
 *  - removal DELETES from the live array and the recipe together — no
 *    tombstones, and Reset does not resurrect;
 *  - platforms is DERIVED both directions — removing a platform's last
 *    entry removes its id, and the stored array always equals the
 *    derivation over any operation sequence.
 */
import bank from '../data/platformProcedures.json';
import {
  composeAttachObservation,
  pickerObservationUpdate,
  pickerAvailability
} from './procedureTailor';
import { getBankProcedure, resetToCommunityUpdate } from './procedureBank';
import {
  getPlatformProcedures,
  platformRecordContentHash,
  buildPlatformRef,
  forkPlatformProcedure,
  expandProcedureText,
  sortPlatformAddenda,
  derivePlatformsFromObservations,
  platformRefSourceUrl,
  platformRefDrift,
  addendumRowDescriptor
} from './platformBank';

const ITEM_ID = 'PR.AA-05 Ex1'; // production-shaped id — Ex suffix (G24 lesson)
const SUB_ID = 'PR.AA-05';
const BOTH = ['google-workspace', 'microsoft-365'];
const trunkEntry = getBankProcedure(ITEM_ID);
const allOffers = () => getPlatformProcedures(SUB_ID, BOTH);

/** A live observation as the wizard creates it, with the given offers. */
const observationWith = (offers) => composeAttachObservation(trunkEntry, offers);

/** Neutralize the attach wall-clock for producer-identity comparison. */
const stampNeutral = (source) => ({ ...source, attachedAt: 'T' });

const FOREIGN_REF = {
  corpusId: 'foreign-corpus',
  corpusVersion: 'ffffffffffffffff',
  policyId: 'gone.policy.1.1v1',
  contentHash: '0123456789abcdef'
};

describe('helpers: source url, canonical sort, row descriptor', () => {
  const offer = allOffers()[0];

  test('platformRefSourceUrl: current corpus attribution for a resolvable ref, null when unresolved', () => {
    const ref = buildPlatformRef(offer.record, offer.corpusId);
    expect(platformRefSourceUrl(ref)).toBe(offer.record.attribution.sourceUrl);
    expect(platformRefSourceUrl(FOREIGN_REF)).toBeNull();
    expect(platformRefSourceUrl(undefined)).toBeNull();
  });

  test('sortPlatformAddenda: committed-map order for placeable entries; unplaceable keep relative order after', () => {
    const offers = allOffers();
    const refs = offers.map((o) => buildPlatformRef(o.record, o.corpusId));
    const shuffled = [refs[2], FOREIGN_REF, refs[0], { ...FOREIGN_REF, policyId: 'gone.2' }, refs[1]];
    const sorted = sortPlatformAddenda(shuffled, SUB_ID);
    expect(sorted.slice(0, 3).map((r) => r.policyId)).toEqual(refs.slice(0, 3).map((r) => r.policyId));
    expect(sorted[3].policyId).toBe(FOREIGN_REF.policyId);
    expect(sorted[4].policyId).toBe('gone.2');
    // pure re-ordering: the same entry OBJECTS pass through untouched
    sorted.forEach((entry) => expect(shuffled).toContain(entry));
  });

  test('addendumRowDescriptor: one derivation feeds rows and counts — drifted, unresolved, fork discriminated', () => {
    const fresh = buildPlatformRef(offer.record, offer.corpusId);
    expect(addendumRowDescriptor(fresh)).toMatchObject({
      policyId: fresh.policyId,
      drifted: false,
      unresolved: false,
      fork: false,
      sourceUrl: offer.record.attribution.sourceUrl
    });
    const drifted = { ...fresh, contentHash: '0000000000000000' };
    expect(addendumRowDescriptor(drifted)).toMatchObject({ drifted: true, unresolved: false });
    expect(addendumRowDescriptor(FOREIGN_REF)).toMatchObject({
      drifted: false,
      unresolved: true,
      sourceUrl: null,
      platformText: null
    });
    const fork = forkPlatformProcedure({ ...fresh, contentHash: '0000000000000000' }, 'User text.');
    // a fork badges neither drift nor unresolved — its remedy (adopt) is refused on forks
    expect(addendumRowDescriptor(fork)).toMatchObject({ fork: true, drifted: false, unresolved: false });
  });
});

describe('pickerObservationUpdate — add / addAll', () => {
  test('add produces EXACTLY what composeAttachObservation produces for the same set (no second composition rule)', () => {
    const offers = allOffers().slice(0, 4);
    const target = observationWith(offers);
    // start from a compose of the first two, picker-add the last two in
    // REVERSED order — the write re-sorts to canonical map order
    let obs = observationWith(offers.slice(0, 2));
    [offers[3], offers[2]].forEach((offer) => {
      const update = pickerObservationUpdate(obs, ITEM_ID, { op: 'add', offer });
      expect(update).not.toBeNull();
      obs = { ...obs, ...update };
    });
    expect(obs.platformProcedures).toEqual(target.platformProcedures);
    expect(stampNeutral(obs.procedureSource)).toEqual(stampNeutral(target.procedureSource));
  });

  test('addAll attaches every not-yet-attached offer in ONE write, canonical order', () => {
    const offers = allOffers();
    let obs = observationWith(offers.slice(1, 2)); // one mid-list ref attached
    const update = pickerObservationUpdate(obs, ITEM_ID, { op: 'addAll', offers });
    obs = { ...obs, ...update };
    expect(obs.platformProcedures).toEqual(observationWith(offers).platformProcedures);
  });

  test('the producer NEVER touches trunk text — no update carries a testProcedures key', () => {
    const offers = allOffers().slice(0, 2);
    const obs = observationWith(offers);
    const ops = [
      { op: 'add', offer: allOffers()[2] },
      { op: 'remove', ref: obs.platformProcedures[0] },
      { op: 'addAll', offers: allOffers() }
    ];
    ops.forEach((operation) => {
      const update = pickerObservationUpdate(obs, ITEM_ID, operation);
      expect(update).not.toBeNull();
      expect('testProcedures' in update).toBe(false);
    });
  });

  test('no-ops return null: add of an attached policy, addAll when everything is attached', () => {
    const offers = allOffers();
    const obs = observationWith(offers);
    expect(pickerObservationUpdate(obs, ITEM_ID, { op: 'add', offer: offers[0] })).toBeNull();
    expect(pickerObservationUpdate(obs, ITEM_ID, { op: 'addAll', offers })).toBeNull();
  });

  test('attach requires a bank-attached trunk — a hand-written observation refuses add', () => {
    const obs = { testProcedures: 'My own words.', quarters: {} };
    expect(pickerObservationUpdate(obs, ITEM_ID, { op: 'add', offer: allOffers()[0] })).toBeNull();
  });
});

describe('pickerObservationUpdate — remove (ratified: delete, no tombstones)', () => {
  test('remove deletes from the live array AND the recipe together; expansion loses the block', () => {
    const offers = allOffers().slice(0, 3);
    const obs = observationWith(offers);
    const victim = obs.platformProcedures[1];
    const update = pickerObservationUpdate(obs, ITEM_ID, { op: 'remove', ref: victim });
    const next = { ...obs, ...update };
    expect(next.platformProcedures.map((r) => r.policyId)).not.toContain(victim.policyId);
    const recipePolicies = next.procedureSource.components
      .filter((c) => c.kind === 'platform-ref')
      .map((c) => c.policyId);
    expect(recipePolicies).not.toContain(victim.policyId);
    expect(recipePolicies).toHaveLength(2);
    expect(expandProcedureText(next)).not.toContain(victim.policyId);
  });

  test('removing the LAST entry leaves an empty array, a trunk-only recipe, and trunk-identical expansion', () => {
    const offers = allOffers().slice(0, 1);
    const obs = observationWith(offers);
    const update = pickerObservationUpdate(obs, ITEM_ID, { op: 'remove', ref: obs.platformProcedures[0] });
    const next = { ...obs, ...update };
    expect(next.platformProcedures).toEqual([]);
    expect(next.procedureSource.components).toEqual([
      expect.objectContaining({ kind: 'trunk', bankId: SUB_ID })
    ]);
    expect(expandProcedureText(next)).toBe(next.testProcedures);
  });

  test('remove of a non-attached ref is a null no-op', () => {
    const obs = observationWith(allOffers().slice(0, 2));
    expect(pickerObservationUpdate(obs, ITEM_ID, { op: 'remove', ref: FOREIGN_REF })).toBeNull();
  });

  test('remove works on a hand-written-trunk observation (no procedureSource): no throw, no fabricated trunk component', () => {
    // The imported-observation shape pickerAvailability opens for: refs
    // present, trunk not bank-attached. Removal must not synthesize trunk
    // provenance that never existed.
    const obs = { testProcedures: 'Mine.', platformProcedures: [FOREIGN_REF] };
    const update = pickerObservationUpdate(obs, ITEM_ID, { op: 'remove', ref: FOREIGN_REF });
    expect(update.platformProcedures).toEqual([]);
    expect(update.procedureSource.components).toEqual([]);
    expect(update.procedureSource.bank).toBeUndefined();
  });

  test('Reset does NOT resurrect a removed addendum — production Reset replays the re-recorded recipe', () => {
    const offers = allOffers().slice(0, 3);
    const obs = observationWith(offers);
    const victim = obs.platformProcedures[1];
    const survivors = obs.platformProcedures.filter((r) => r !== victim).map((r) => r.policyId);
    const next = { ...obs, ...pickerObservationUpdate(obs, ITEM_ID, { op: 'remove', ref: victim }) };
    const reset = resetToCommunityUpdate(ITEM_ID, next.procedureSource);
    expect(reset.platformProcedures.map((r) => r.policyId)).toEqual(survivors);
    expect(reset.platformProcedures.map((r) => r.policyId)).not.toContain(victim.policyId);
  });
});

describe('pickerObservationUpdate — adopt (ratified: the ONLY contentHash writer)', () => {
  const driftedObservation = () => {
    const offers = allOffers().slice(0, 3);
    const obs = observationWith(offers);
    // middle entry drifts: attach-time fingerprint no longer matches
    const entries = obs.platformProcedures.map((r, i) =>
      i === 1 ? { ...r, contentHash: '0000000000000000' } : r);
    return {
      ...obs,
      platformProcedures: entries,
      procedureSource: {
        ...obs.procedureSource,
        components: [
          obs.procedureSource.components[0],
          ...entries.map((r) => ({ kind: 'platform-ref', ...r }))
        ]
      }
    };
  };

  test('adopt replaces the one entry with a fresh fingerprint of the CURRENT record; drift clears; position holds', () => {
    const obs = driftedObservation();
    const target = obs.platformProcedures[1];
    expect(platformRefDrift(target)).toBe(true);
    const update = pickerObservationUpdate(obs, ITEM_ID, { op: 'adopt', ref: target });
    const next = { ...obs, ...update };
    const adopted = next.platformProcedures[1];
    expect(adopted.policyId).toBe(target.policyId);
    expect(adopted.contentHash).toBe(
      platformRecordContentHash(bank.procedures[target.policyId]));
    expect(adopted.corpusVersion).toBe(bank.bankVersion);
    expect(platformRefDrift(adopted)).toBe(false);
    // recipe carries the adopted fingerprint too
    expect(next.procedureSource.components[2]).toMatchObject({
      kind: 'platform-ref',
      policyId: target.policyId,
      contentHash: adopted.contentHash
    });
  });

  test('adopt no-ops: non-drifted ref, unresolvable ref, fork — all null', () => {
    const obs = driftedObservation();
    expect(pickerObservationUpdate(obs, ITEM_ID, { op: 'adopt', ref: obs.platformProcedures[0] })).toBeNull();
    const withForeign = { ...obs, platformProcedures: [...obs.platformProcedures, FOREIGN_REF] };
    expect(pickerObservationUpdate(withForeign, ITEM_ID, { op: 'adopt', ref: FOREIGN_REF })).toBeNull();
    const fork = forkPlatformProcedure(
      { ...obs.platformProcedures[0], contentHash: '0000000000000000' }, 'User text.');
    const withFork = { ...obs, platformProcedures: [fork, ...obs.platformProcedures.slice(1)] };
    expect(pickerObservationUpdate(withFork, ITEM_ID, { op: 'adopt', ref: fork })).toBeNull();
  });

  test('adopt-then-Reset: the adopted (current-hash) ref survives Reset as the pristine ref', () => {
    const obs = driftedObservation();
    const target = obs.platformProcedures[1];
    const next = { ...obs, ...pickerObservationUpdate(obs, ITEM_ID, { op: 'adopt', ref: target }) };
    const reset = resetToCommunityUpdate(ITEM_ID, next.procedureSource);
    const resetRef = reset.platformProcedures.find((r) => r.policyId === target.policyId);
    expect(resetRef.contentHash).toBe(platformRecordContentHash(bank.procedures[target.policyId]));
  });

  test('GUARD: add and remove of one ref change NO other ref\'s contentHash — two drifted neighbors stay byte-stable', () => {
    const offers = allOffers().slice(0, 4);
    const obs = observationWith(offers);
    // two entries drift; they must ride every unrelated write untouched
    const entries = obs.platformProcedures.map((r, i) =>
      i === 0 || i === 2 ? { ...r, contentHash: `000000000000000${i}` } : r);
    const base = { ...obs, platformProcedures: entries };
    const spare = allOffers()[5];

    const afterAdd = { ...base, ...pickerObservationUpdate(base, ITEM_ID, { op: 'add', offer: spare }) };
    entries.forEach((before) => {
      const after = afterAdd.platformProcedures.find((r) => r.policyId === before.policyId);
      expect(after.contentHash).toBe(before.contentHash);
    });

    const afterRemove = { ...base, ...pickerObservationUpdate(base, ITEM_ID, { op: 'remove', ref: entries[1] }) };
    entries.filter((_, i) => i !== 1).forEach((before) => {
      const after = afterRemove.platformProcedures.find((r) => r.policyId === before.policyId);
      expect(after.contentHash).toBe(before.contentHash);
    });
  });

  test('no read path mutates a ref: expansion and badge derivation leave a frozen drifted entry untouched', () => {
    const ref = Object.freeze({
      ...buildPlatformRef(allOffers()[0].record),
      contentHash: '0000000000000000'
    });
    const obs = { testProcedures: 'Trunk.', platformProcedures: Object.freeze([ref]) };
    expect(() => expandProcedureText(obs)).not.toThrow();
    expect(() => addendumRowDescriptor(ref)).not.toThrow();
    expect(ref.contentHash).toBe('0000000000000000');
    // INDEPENDENT second killer, not resting on freeze semantics: an
    // unfrozen drifted entry rides the same render path — a heal that
    // rewrites the stored fingerprint succeeds here (nothing throws) and
    // is caught by the byte assertion + the production drift predicate.
    const soft = { ...buildPlatformRef(allOffers()[0].record), contentHash: '0000000000000000' };
    expandProcedureText({ testProcedures: 'Trunk.', platformProcedures: [soft] });
    addendumRowDescriptor(soft);
    expect(soft.contentHash).toBe('0000000000000000');
    expect(platformRefDrift(soft)).toBe(true);
  });

  test('add is refused when the policy is already present as a FORK — dedup keys on identity, not shape', () => {
    const offers = allOffers().slice(0, 2);
    const obs = observationWith(offers);
    const fork = forkPlatformProcedure(obs.platformProcedures[0], 'User text.');
    const withFork = { ...obs, platformProcedures: [fork, obs.platformProcedures[1]] };
    expect(pickerObservationUpdate(withFork, ITEM_ID, { op: 'add', offer: offers[0] })).toBeNull();
  });
});

describe('order stability + attractor boundary', () => {
  test('remove + re-add lands back in committed-map position, never appended (regulatory order churn killed)', () => {
    const offers = allOffers().slice(0, 5);
    const obs = observationWith(offers);
    const canonical = obs.platformProcedures.map((r) => r.policyId);
    const victimOffer = offers[2];
    const afterRemove = { ...obs, ...pickerObservationUpdate(obs, ITEM_ID, { op: 'remove', ref: obs.platformProcedures[2] }) };
    const afterReAdd = { ...afterRemove, ...pickerObservationUpdate(afterRemove, ITEM_ID, { op: 'add', offer: victimOffer }) };
    expect(afterReAdd.platformProcedures.map((r) => r.policyId)).toEqual(canonical);
  });

  test('attractor full set: PR.DS-10 addAll 122 → remove one → re-add → 122 in canonical order', () => {
    const attractorItem = 'PR.DS-10 Ex1';
    const attractorEntry = getBankProcedure(attractorItem);
    const offers = getPlatformProcedures('PR.DS-10', BOTH);
    expect(offers).toHaveLength(122);
    let obs = composeAttachObservation(attractorEntry, []);
    obs = { ...obs, ...pickerObservationUpdate(obs, attractorItem, { op: 'addAll', offers }) };
    expect(obs.platformProcedures).toHaveLength(122);
    const canonical = obs.platformProcedures.map((r) => r.policyId);
    const victim = obs.platformProcedures[60];
    const victimOffer = offers.find((o) => o.policyId === victim.policyId);
    obs = { ...obs, ...pickerObservationUpdate(obs, attractorItem, { op: 'remove', ref: victim }) };
    expect(obs.platformProcedures).toHaveLength(121);
    obs = { ...obs, ...pickerObservationUpdate(obs, attractorItem, { op: 'add', offer: victimOffer }) };
    expect(obs.platformProcedures.map((r) => r.policyId)).toEqual(canonical);
    expect(obs.procedureSource.components).toHaveLength(123); // trunk + 122
  });
});

describe('heal-on-write (legacy recipes) + fork preservation', () => {
  test('a legacy no-recipe observation gets a FULL recipe re-record on first picker write', () => {
    const offers = allOffers().slice(0, 2);
    const composed = observationWith(offers);
    const legacy = {
      testProcedures: composed.testProcedures,
      platformProcedures: composed.platformProcedures,
      procedureSource: (({ components, ...rest }) => rest)(composed.procedureSource)
    };
    expect(legacy.procedureSource.components).toBeUndefined();
    const update = pickerObservationUpdate(legacy, ITEM_ID, { op: 'add', offer: allOffers()[2] });
    const next = { ...legacy, ...update };
    expect(next.procedureSource.components[0]).toMatchObject({
      kind: 'trunk',
      bank: 'community',
      bankId: SUB_ID
    });
    expect(next.procedureSource.components).toHaveLength(4); // trunk + 3
  });

  test('an existing trunk component rides every write VERBATIM (identity recorded at attach is never re-derived)', () => {
    const obs = observationWith(allOffers().slice(0, 2));
    const trunkBefore = obs.procedureSource.components[0];
    const next = { ...obs, ...pickerObservationUpdate(obs, ITEM_ID, { op: 'add', offer: allOffers()[2] }) };
    expect(next.procedureSource.components[0]).toEqual(trunkBefore);
  });

  test('a fork entry passes through unrelated writes byte-verbatim — rebuild is re-ordering, never regeneration', () => {
    const offers = allOffers().slice(0, 3);
    const obs = observationWith(offers);
    const fork = forkPlatformProcedure(obs.platformProcedures[1], 'My hardened variant.');
    expect(fork).not.toBeNull();
    const entries = obs.platformProcedures.map((r, i) => (i === 1 ? fork : r));
    const base = { ...obs, platformProcedures: entries };
    const next = { ...base, ...pickerObservationUpdate(base, ITEM_ID, { op: 'add', offer: allOffers()[3] }) };
    const forkAfter = next.platformProcedures.find((e) => e.policyId === fork.policyId);
    expect(forkAfter).toEqual(fork);
    expect(forkAfter.text).toBe('My hardened variant.');
    // the recipe records the fork's REF identity (Reset restores the pristine reference)
    expect(next.procedureSource.components.find((c) => c.policyId === fork.policyId)).toEqual({
      kind: 'platform-ref',
      corpusId: fork.corpusId,
      corpusVersion: fork.corpusVersion,
      policyId: fork.policyId,
      contentHash: fork.contentHash
    });
  });
});

describe('derived platforms (ratified: recomputed, never mutated)', () => {
  const gwsOffer = () => getPlatformProcedures('PR.DS-10', ['google-workspace'])[0];
  const m365Offer = () => getPlatformProcedures('PR.DS-10', ['microsoft-365'])[0];

  test('derivation is the sorted platform set of resolvable entries across observations, both directions', () => {
    const a = composeAttachObservation(getBankProcedure('PR.DS-10 Ex1'), [gwsOffer(), m365Offer()]);
    const b = composeAttachObservation(trunkEntry, [allOffers()[0]]);
    const observations = { 'PR.DS-10 Ex1': a, [ITEM_ID]: b };
    expect(derivePlatformsFromObservations(observations)).toEqual(
      ['google-workspace', 'microsoft-365']);
    // remove the only M365 entries → the id drops out (derived means derived)
    const aGwsOnly = { ...a, ...pickerObservationUpdate(a, 'PR.DS-10 Ex1', { op: 'remove', ref: a.platformProcedures.find((r) => r.policyId.startsWith('ms.')) }) };
    const bEmpty = { ...b, ...pickerObservationUpdate(b, ITEM_ID, { op: 'remove', ref: b.platformProcedures[0] }) };
    expect(derivePlatformsFromObservations({ 'PR.DS-10 Ex1': aGwsOnly, [ITEM_ID]: bEmpty }))
      .toEqual(['google-workspace']);
    // unresolvable entries contribute nothing — their platform is unknowable
    expect(derivePlatformsFromObservations({ x: { platformProcedures: [FOREIGN_REF] } })).toEqual([]);
    expect(derivePlatformsFromObservations({})).toEqual([]);
    expect(derivePlatformsFromObservations(undefined)).toEqual([]);
  });

  test('forks count toward the derivation when resolvable; an orphan fork contributes nothing', () => {
    const base = composeAttachObservation(getBankProcedure('PR.DS-10 Ex1'), [gwsOffer()]);
    const fork = forkPlatformProcedure(base.platformProcedures[0], 'User text.');
    expect(derivePlatformsFromObservations({ a: { platformProcedures: [fork] } }))
      .toEqual(['google-workspace']);
    const orphanFork = { ...fork, corpusId: 'foreign-corpus' };
    expect(derivePlatformsFromObservations({ a: { platformProcedures: [orphanFork] } }))
      .toEqual([]);
  });

  test('INVARIANT: over any operation sequence, the stored array equals the derivation (single call site contract)', () => {
    let observations = {
      [ITEM_ID]: composeAttachObservation(trunkEntry, []),
      'PR.DS-10 Ex1': composeAttachObservation(getBankProcedure('PR.DS-10 Ex1'), [])
    };
    let stored = derivePlatformsFromObservations(observations);
    expect(stored).toEqual([]);
    const apply = (itemId, operation) => {
      const update = pickerObservationUpdate(observations[itemId], itemId, operation);
      if (update) {
        observations = { ...observations, [itemId]: { ...observations[itemId], ...update } };
        stored = derivePlatformsFromObservations(observations); // the page's sync step
      }
      expect(stored).toEqual(derivePlatformsFromObservations(observations));
    };
    apply(ITEM_ID, { op: 'add', offer: allOffers()[0] });
    apply('PR.DS-10 Ex1', { op: 'add', offer: m365Offer() });
    apply('PR.DS-10 Ex1', { op: 'add', offer: gwsOffer() });
    apply(ITEM_ID, { op: 'remove', ref: observations[ITEM_ID].platformProcedures[0] });
    apply('PR.DS-10 Ex1', { op: 'remove', ref: observations['PR.DS-10 Ex1'].platformProcedures[0] });
    apply('PR.DS-10 Ex1', { op: 'add', offer: m365Offer() }); // no-op guard inside apply
    // adopt step (upstream regen simulated by staling one fingerprint):
    // the invariant must hold through the one hash-writing operation too
    const target = observations['PR.DS-10 Ex1'].platformProcedures[0];
    const staled = { ...target, contentHash: '0000000000000000' };
    observations = {
      ...observations,
      'PR.DS-10 Ex1': {
        ...observations['PR.DS-10 Ex1'],
        platformProcedures: observations['PR.DS-10 Ex1'].platformProcedures.map((r) =>
          r === target ? staled : r)
      }
    };
    apply('PR.DS-10 Ex1', { op: 'adopt', ref: staled });
    expect(stored).toEqual(derivePlatformsFromObservations(observations));
  });

  test('PAGE PIN: every composition-changing handler in Assessments.js syncs derived platforms after its write', () => {
    // The invariant test above proves producer + derivation COMPOSE; this
    // pin proves the page actually runs the sync after each write — the
    // one place the ratified derived-not-mutated contract could go stale
    // silently (same grep-pin idiom as the egress census).
    const fs = require('fs');
    const path = require('path');
    const page = fs.readFileSync(path.join(__dirname, '../pages/Assessments.js'), 'utf8');
    const writeThenSync =
      page.match(/updateObservation\(currentAssessmentId, selectedItemId, update\);\s*\n\s*syncDerivedPlatforms\(\);/g) || [];
    // exactly two: handlePlatformCheckOperation and handleInsertBankProcedure
    expect(writeThenSync).toHaveLength(2);
    // and exactly one producer call site
    expect(page.match(/pickerObservationUpdate\(/g)).toHaveLength(1);
    expect(page.match(/derivePlatformsFromObservations\(/g)).toHaveLength(1);
  });
});

describe('pickerAvailability — branches on the observation, never on assessment platforms', () => {
  test('truth table: attached entries open; offers + bank trunk attach; hand-written trunk cannot attach', () => {
    const withRefs = observationWith(allOffers().slice(0, 1));
    expect(pickerAvailability(withRefs, ITEM_ID, BOTH)).toEqual({ canOpen: true, canAttach: true });
    const zeroAttach = composeAttachObservation(trunkEntry, []);
    expect(pickerAvailability(zeroAttach, ITEM_ID, BOTH)).toEqual({ canOpen: true, canAttach: true });
    const handWritten = { testProcedures: 'Mine.', quarters: {} };
    expect(pickerAvailability(handWritten, ITEM_ID, BOTH)).toEqual({ canOpen: false, canAttach: false });
    const handWrittenWithRefs = { testProcedures: 'Mine.', platformProcedures: [FOREIGN_REF] };
    expect(pickerAvailability(handWrittenWithRefs, ITEM_ID, BOTH)).toEqual({ canOpen: true, canAttach: false });
    // a subcategory with no offers at all cannot open without refs
    expect(pickerAvailability(composeAttachObservation(getBankProcedure('GV.OC-01 Ex1'), []), 'GV.OC-01 Ex1', BOTH))
      .toEqual({ canOpen: false, canAttach: false });
  });

  test('Anti: the badge/picker modules never read the assessment-level platforms array', () => {
    const fs = require('fs');
    const path = require('path');
    const FILES = [
      '../components/PlatformAddendumBadges.js',
      '../components/PlatformCheckPicker.js'
    ];
    FILES.forEach((rel) => {
      const code = fs.readFileSync(path.join(__dirname, rel), 'utf8');
      expect(code).not.toMatch(/\.platforms\b/);
      expect(code).not.toMatch(/platforms\.length/);
    });
  });
});
