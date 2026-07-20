/**
 * Unit suite for the 800-53 -> CSF 2.0 join logic (PR-4). The decorrelation
 * fixtures follow the G19-G21 discipline: each is built so a WRONG
 * implementation succeeds at its wrong behavior and fails the test —
 * output-divergent where possible, not label-only. Target mutant classes
 * (also the pr-test-analyzer's live-mutation targets): grain-blind joins,
 * truncate-first joins, normalization-skipping joins, signature-blind
 * queueing, and skip-on-unparseable parsers.
 */
import {
  GENERATOR_VERSION,
  PINNED_LANE,
  JUSTIFICATION,
  MappingValidationError,
  parseControl,
  normalizeOlirRef,
  buildOlirIndex,
  resolveControl,
  signatureOf,
  deriveMapping
} from './subcategoryMapping.mjs';

/** Converted-artifact fixture builder (lane refs RAW, as vendored). */
const convertedWith = (subcategories, lane = PINNED_LANE) => ({
  convertedFormat: 'olir-csf2-sp80053-refs-v1',
  converterVersion: 1,
  lanes: [lane],
  subcategories
});

const bankWith = (records) =>
  Object.fromEntries(
    records.map((r) => [
      r.policyId.toLowerCase(),
      { platform: 'google-workspace', ...r }
    ])
  );

const NO_OVERRIDES = { gapTable: {}, byPolicy: {}, bySignature: {} };

describe('parseControl', () => {
  test('parses all five measured bank forms', () => {
    expect(parseControl('IA-2')).toEqual({ family: 'IA', number: 2, enhancement: null, subpart: null });
    expect(parseControl('IA-2(1)')).toEqual({ family: 'IA', number: 2, enhancement: 1, subpart: null });
    expect(parseControl('IA-5c')).toEqual({ family: 'IA', number: 5, enhancement: null, subpart: 'c' });
    expect(parseControl('SC-7(10)(a)')).toEqual({ family: 'SC', number: 7, enhancement: 10, subpart: 'a' });
    expect(parseControl('SC-7(10)a')).toEqual({ family: 'SC', number: 7, enhancement: 10, subpart: 'a' });
  });

  test('returns null on non-control strings (family codes, garbage)', () => {
    expect(parseControl('PT')).toBeNull();
    expect(parseControl('TASK P-2')).toBeNull();
    expect(parseControl('')).toBeNull();
  });
});

describe('normalizeOlirRef', () => {
  test('strips zero-padding from base and enhancement forms', () => {
    expect(normalizeOlirRef('AC-07')).toBe('AC-7');
    expect(normalizeOlirRef('SI-02(07)')).toBe('SI-2(7)');
    expect(normalizeOlirRef('SA-15(13)')).toBe('SA-15(13)');
  });

  test('flags sub-part forms for the index-build assertion', () => {
    expect(normalizeOlirRef('IA-05c')).toEqual({ subpart: true });
  });
});

describe('buildOlirIndex', () => {
  test('normalizes raw refs and unions subcategories per control', () => {
    const index = buildOlirIndex(
      convertedWith({
        'PR.AA-03': { [PINNED_LANE]: ['IA-02', 'AC-07'] },
        'PR.AA-01': { [PINNED_LANE]: ['IA-02'] }
      }),
      PINNED_LANE
    );
    expect(index.get('IA-2')).toEqual(['PR.AA-01', 'PR.AA-03']);
    expect(index.get('AC-7')).toEqual(['PR.AA-03']);
  });

  test('throws on a missing lane', () => {
    expect(() => buildOlirIndex(convertedWith({}, 'SP 800-53 Rev 5.1.1'), PINNED_LANE)).toThrow(
      MappingValidationError
    );
  });

  test('the no-subpart assumption is a loud assertion, not a silent truth', () => {
    expect(() =>
      buildOlirIndex(convertedWith({ 'PR.AA-03': { [PINNED_LANE]: ['IA-05c'] } }), PINNED_LANE)
    ).toThrow(/sub-part form/);
  });

  test('throws on an unparseable lane reference', () => {
    expect(() =>
      buildOlirIndex(convertedWith({ 'PR.AA-03': { [PINNED_LANE]: ['garbage ref'] } }), PINNED_LANE)
    ).toThrow(/unparseable OLIR reference/);
  });
});

describe('resolveControl — grain doctrine', () => {
  test('DECORRELATION (truncate-first mutant): enhancement and base map to DIFFERENT targets — stated grain must win', () => {
    // A join that truncates IA-2(1) to IA-2 before trying the stated form
    // still finds a match — at the WRONG target. Output-divergent fixture.
    const index = buildOlirIndex(
      convertedWith({
        'PR.AA-03': { [PINNED_LANE]: ['IA-02(01)'] },
        'PR.AA-01': { [PINNED_LANE]: ['IA-02'] }
      }),
      PINNED_LANE
    );
    const res = resolveControl(parseControl('IA-2(1)'), index);
    expect(res.grain).toBe('exact');
    expect(res.matchedRef).toBe('IA-2(1)');
    expect(res.subcategories).toEqual(['PR.AA-03']);
  });

  test('DECORRELATION (grain-blind mutant): base-only index + enhancement control ⇒ enh-fallback, never exact', () => {
    const index = buildOlirIndex(convertedWith({ 'PR.AA-01': { [PINNED_LANE]: ['IA-02'] } }), PINNED_LANE);
    const res = resolveControl(parseControl('IA-2(1)'), index);
    expect(res.subcategories).toEqual(['PR.AA-01']);
    expect(res.grain).toBe('enh-fallback');
  });

  test('DECORRELATION (subpart-dropping parser): IA-5c resolves subpart-truncated to IA-5 targets', () => {
    // A parser that drops letter-suffixed controls as unparseable loses this
    // pair entirely; a grain-blind one labels it exact. Both fail here.
    const index = buildOlirIndex(convertedWith({ 'PR.AA-02': { [PINNED_LANE]: ['IA-05'] } }), PINNED_LANE);
    const res = resolveControl(parseControl('IA-5c'), index);
    expect(res.subcategories).toEqual(['PR.AA-02']);
    expect(res.grain).toBe('subpart-truncated');
  });

  test('both coarsenings (SC-7(10)(a) -> SC-7): the coarsest step wins the label', () => {
    const index = buildOlirIndex(convertedWith({ 'DE.CM-01': { [PINNED_LANE]: ['SC-07'] } }), PINNED_LANE);
    const res = resolveControl(parseControl('SC-7(10)(a)'), index);
    expect(res.subcategories).toEqual(['DE.CM-01']);
    expect(res.grain).toBe('enh-fallback');
  });

  test('sub-part truncation stops at the enhancement when the enhancement is indexed', () => {
    const index = buildOlirIndex(
      convertedWith({
        'DE.CM-09': { [PINNED_LANE]: ['SC-07(10)'] },
        'DE.CM-01': { [PINNED_LANE]: ['SC-07'] }
      }),
      PINNED_LANE
    );
    const res = resolveControl(parseControl('SC-7(10)(a)'), index);
    expect(res.subcategories).toEqual(['DE.CM-09']);
    expect(res.grain).toBe('subpart-truncated');
  });

  test('DECORRELATION (normalization-skipping mutant): zero-padded lane refs must still join', () => {
    // Raw vendored refs are zero-padded; bank controls are not. A join that
    // skips normalization matches nothing and un-maps the policy.
    const index = buildOlirIndex(convertedWith({ 'PR.PS-04': { [PINNED_LANE]: ['AU-06'] } }), PINNED_LANE);
    const res = resolveControl(parseControl('AU-6'), index);
    expect(res.grain).toBe('exact');
    expect(res.subcategories).toEqual(['PR.PS-04']);
  });

  test('unmapped when nothing matches at any grain', () => {
    const index = buildOlirIndex(convertedWith({ 'PR.AA-01': { [PINNED_LANE]: ['IA-02'] } }), PINNED_LANE);
    expect(resolveControl(parseControl('SI-8'), index)).toEqual({ grain: 'unmapped' });
  });
});

describe('deriveMapping — provenance, overrides, totals', () => {
  const converted = convertedWith({
    'PR.AA-01': { [PINNED_LANE]: ['IA-02'] },
    'DE.CM-01': { [PINNED_LANE]: ['SI-03'] },
    'DE.CM-09': {}
  });
  const bank = bankWith([
    { policyId: 'GWS.GMAIL.1.1v1', nist80053: ['IA-2', 'SI-8'] },
    { policyId: 'GWS.GMAIL.2.1v1', nist80053: ['SI-8'] },
    { policyId: 'MS.EXO.1.1v1', platform: 'microsoft-365', nist80053: ['SI-8'] }
  ]);
  const gap = { gapTable: { 'SI-8': { subcategories: ['DE.CM-01', 'DE.CM-09'] } }, byPolicy: {}, bySignature: {} };

  test('gap edges apply to ALL carriers by base form; pair grain only on derived pairs', () => {
    const { policies } = deriveMapping({ procedures: bank, converted, overrides: gap });
    const p1 = policies['gws.gmail.1.1v1'];
    expect(p1.pairs).toEqual([
      { subcategoryId: 'DE.CM-01', provenance: 'authored', via: ['SI-8'] },
      { subcategoryId: 'DE.CM-09', provenance: 'authored', via: ['SI-8'] },
      { subcategoryId: 'PR.AA-01', provenance: 'derived', via: ['IA-2'], grain: 'exact', grainVias: { exact: 1 } }
    ]);
    expect(policies['gws.gmail.2.1v1'].pairs.map((p) => p.subcategoryId)).toEqual(['DE.CM-01', 'DE.CM-09']);
  });

  test('a pair supported by both derived and authored vias stays derived (mixed-provenance rule)', () => {
    const withSi3 = bankWith([{ policyId: 'GWS.GMAIL.3.1v1', nist80053: ['SI-3', 'SI-8'] }]);
    const { policies } = deriveMapping({ procedures: withSi3, converted, overrides: gap });
    const decm01 = policies['gws.gmail.3.1v1'].pairs.find((p) => p.subcategoryId === 'DE.CM-01');
    expect(decm01.provenance).toBe('derived');
    expect(decm01.grain).toBe('exact');
    expect(decm01.via).toEqual(['SI-3', 'SI-8']);
  });

  test('ORDERING (creation-only mutant): a gap via that sorts BEFORE the derived via still upgrades the pair to derived', () => {
    // AC-21 (gap) sorts before SI-3 (derived); a mutant that sets provenance
    // and grain only at pair creation leaves this pair authored/grainless.
    const orderingConverted = convertedWith({ 'DE.CM-01': { [PINNED_LANE]: ['SI-03'] } });
    const orderingBank = bankWith([{ policyId: 'MS.TEST.1.1v1', platform: 'microsoft-365', nist80053: ['AC-21', 'SI-3'] }]);
    const orderingGap = { gapTable: { 'AC-21': { subcategories: ['DE.CM-01'] } }, byPolicy: {}, bySignature: {} };
    const { policies } = deriveMapping({ procedures: orderingBank, converted: orderingConverted, overrides: orderingGap });
    expect(policies['ms.test.1.1v1'].pairs).toEqual([
      { subcategoryId: 'DE.CM-01', provenance: 'derived', via: ['AC-21', 'SI-3'], grain: 'exact', grainVias: { exact: 1 } }
    ]);
  });

  test('grainVias carries the lossless per-grain via counts; the grain scalar is its finest key', () => {
    // One exact via riding with a coarser one must NOT read as all-exact.
    const multiConverted = convertedWith({
      'PR.AA-01': { [PINNED_LANE]: ['IA-02', 'IA-05'] }
    });
    const multiBank = bankWith([{ policyId: 'GWS.TEST.2.1v1', nist80053: ['IA-2', 'IA-5c'] }]);
    const { policies } = deriveMapping({ procedures: multiBank, converted: multiConverted, overrides: NO_OVERRIDES });
    const pair = policies['gws.test.2.1v1'].pairs[0];
    expect(pair.grain).toBe('exact');
    expect(pair.grainVias).toEqual({ exact: 1, 'subpart-truncated': 1 });
  });

  test('zero-pair policies ship explicit empty pairs with a reason, never go absent', () => {
    const { policies, stats } = deriveMapping({ procedures: bank, converted, overrides: NO_OVERRIDES });
    expect(Object.keys(policies)).toHaveLength(3);
    const empty = policies['gws.gmail.2.1v1'];
    expect(empty.pairs).toEqual([]);
    expect(empty.emptyReason).toMatch(/no OLIR .* reference and no gap-table row covers: SI-8/);
    expect(stats.emptyPolicies).toEqual(['GWS.GMAIL.2.1v1', 'MS.EXO.1.1v1']);
  });

  test('GAP POLARITY: removing the SI-8 row un-maps the spam surface', () => {
    const withGap = deriveMapping({ procedures: bank, converted, overrides: gap });
    const withoutGap = deriveMapping({ procedures: bank, converted, overrides: NO_OVERRIDES });
    expect(withGap.stats.emptyPolicies).toEqual([]);
    expect(withoutGap.stats.emptyPolicies).toContain('GWS.GMAIL.2.1v1');
  });

  test('DECORRELATION (signature-blind mutant): identical control sets collapse to one signature', () => {
    const { signatures, stats } = deriveMapping({ procedures: bank, converted, overrides: gap });
    // GWS.GMAIL.2.1v1 and MS.EXO.1.1v1 share the SI-8 signature across
    // platforms; a policy-keyed queue reports 3 entries and fails.
    expect(stats.signatureCount).toBe(2);
    expect(signatures.get('SI-8')).toEqual(['gws.gmail.2.1v1', 'ms.exo.1.1v1']);
    expect(signatureOf(['SI-8', 'IA-2', 'SI-8'])).toBe('IA-2|SI-8');
  });

  test('policy override WINS over derived + authored; overridden pairs carry no grain', () => {
    const overrides = {
      ...gap,
      byPolicy: { 'GWS.GMAIL.1.1v1': { pairs: [{ subcategoryId: 'DE.CM-09' }] } }
    };
    const { policies } = deriveMapping({ procedures: bank, converted, overrides });
    expect(policies['gws.gmail.1.1v1'].pairs).toEqual([
      { subcategoryId: 'DE.CM-09', provenance: 'overridden' }
    ]);
    expect(policies['gws.gmail.1.1v1'].overrideSource).toBe('policy');
  });

  test('signature override applies to every member; policy override beats it', () => {
    const overrides = {
      ...gap,
      bySignature: { 'SI-8': { pairs: [{ subcategoryId: 'DE.CM-01' }] } },
      byPolicy: { 'MS.EXO.1.1v1': { pairs: [] } }
    };
    const { policies } = deriveMapping({ procedures: bank, converted, overrides });
    expect(policies['gws.gmail.2.1v1'].pairs).toEqual([
      { subcategoryId: 'DE.CM-01', provenance: 'overridden' }
    ]);
    const exo = policies['ms.exo.1.1v1'];
    expect(exo.pairs).toEqual([]);
    expect(exo.overrideSource).toBe('policy');
    expect(exo.emptyReason).toMatch(/ratified as mapping to no subcategory/);
  });

  test('OVERRIDE POLARITY: unknown policy key is an error, not a warning', () => {
    const overrides = { ...gap, byPolicy: { 'GWS.GMAIL.9.9v9': { pairs: [] } } };
    expect(() => deriveMapping({ procedures: bank, converted, overrides })).toThrow(
      /byPolicy key "GWS.GMAIL.9.9v9" matches no bank policy/
    );
  });

  test('unknown signature key, unknown subcategory target, unparseable gap control: all errors', () => {
    expect(() =>
      deriveMapping({ procedures: bank, converted, overrides: { ...gap, bySignature: { 'XX-1': { pairs: [] } } } })
    ).toThrow(/bySignature key "XX-1" matches no bank signature/);
    expect(() =>
      deriveMapping({
        procedures: bank,
        converted,
        overrides: { gapTable: { 'SI-8': { subcategories: ['ZZ.ZZ-99'] } }, byPolicy: {}, bySignature: {} }
      })
    ).toThrow(/unknown subcategory "ZZ.ZZ-99"/);
    expect(() =>
      deriveMapping({
        procedures: bank,
        converted,
        overrides: { gapTable: { 'NOT A CONTROL': { subcategories: ['DE.CM-01'] } }, byPolicy: {}, bySignature: {} }
      })
    ).toThrow(/not a parseable 800-53 control form/);
  });

  test('gap-table rot check mirrors the fallback: an enhancement key whose BASE is indexed is redundant too', () => {
    // resolveControl would map AC-2(5) carriers via base fallback to IA-less
    // AC-2 targets, so the authored edge silently conflates with the machine
    // edge — flagged as the same rot class as a stated-form match.
    const enhConverted = convertedWith({ 'PR.AA-01': { [PINNED_LANE]: ['AC-02'] } });
    const enhBank = bankWith([{ policyId: 'GWS.TEST.3.1v1', nist80053: ['AC-2(5)'] }]);
    expect(() =>
      deriveMapping({
        procedures: enhBank,
        converted: enhConverted,
        overrides: { gapTable: { 'AC-2(5)': { subcategories: ['PR.AA-01'] } }, byPolicy: {}, bySignature: {} }
      })
    ).toThrow(/now mapped upstream/);
  });

  test('gap-table rot is loud: upstream-mapped key and zero-carrier key are errors', () => {
    expect(() =>
      deriveMapping({
        procedures: bank,
        converted,
        overrides: { gapTable: { 'IA-2': { subcategories: ['DE.CM-01'] } }, byPolicy: {}, bySignature: {} }
      })
    ).toThrow(/now mapped upstream/);
    expect(() =>
      deriveMapping({
        procedures: bank,
        converted,
        overrides: { gapTable: { 'AU-4': { subcategories: ['DE.CM-01'] } }, byPolicy: {}, bySignature: {} }
      })
    ).toThrow(/carried by no bank policy — stale row/);
  });

  test('a policy carrying an unparseable control fails the whole derivation (skip = silent un-mapping)', () => {
    const bad = bankWith([{ policyId: 'GWS.GMAIL.4.1v1', nist80053: ['IA-2', 'garbage'] }]);
    expect(() => deriveMapping({ procedures: bad, converted, overrides: NO_OVERRIDES })).toThrow(
      /unparseable control "garbage"/
    );
  });

  test('exports the constants the generated artifacts pin', () => {
    expect(GENERATOR_VERSION).toBe(1);
    expect(PINNED_LANE).toBe('SP 800-53 Rev 5.2.0');
    expect(JUSTIFICATION).toMatch(/never scope, never score/);
  });
});
