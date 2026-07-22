/**
 * Environment step logic (plan PR-6). The rules under test are ratified
 * doctrine: user cells are the ONLY exclusion actor (no machine trimming,
 * the retired cap must not resurrect here), offers stay unranked, rows sort
 * in CSF canonical order, and the assessment persists the DERIVED platform
 * set — never raw chip state.
 */
import {
  availablePlatforms,
  buildEnvironmentMatrix,
  buildAttachPlan,
  cellKey,
  toggleCell,
  setColumn,
  columnFullySelected,
  columnTotal,
  countAttached,
  attachedCountForItem,
  compareCsfOrder,
  environmentAttachCopy
} from './environmentStep';
import { getPlatformProcedures } from './platformBank';

const BOTH = ['google-workspace', 'microsoft-365'];
// The measured attractor: 122 offers across both platforms (session pin).
const ATTRACTOR = 'PR.DS-10';

describe('availablePlatforms', () => {
  test('derives the two SCuBA platforms from the committed map, labeled', () => {
    expect(availablePlatforms()).toEqual([
      { id: 'google-workspace', label: 'Google Workspace' },
      { id: 'microsoft-365', label: 'Microsoft 365' }
    ]);
  });
});

describe('buildEnvironmentMatrix', () => {
  test('rows require a community bank entry AND at least one offer; counts exactly match getPlatformProcedures', () => {
    const matrix = buildEnvironmentMatrix([ATTRACTOR, 'GV.OC-01'], BOTH);
    const row = matrix.rows.find((r) => r.itemId === ATTRACTOR);
    expect(row).toBeTruthy();
    BOTH.forEach((p) => {
      expect(row.cells[p]).toBe(getPlatformProcedures(ATTRACTOR, [p]).length);
    });
    expect(row.cells['google-workspace'] + row.cells['microsoft-365']).toBe(122);
  });

  test('scoped items without offers are counted, never silently vanished', () => {
    // GV.OC-01 has a community procedure but no platform offers.
    const matrix = buildEnvironmentMatrix([ATTRACTOR, 'GV.OC-01'], BOTH);
    expect(matrix.rows.map((r) => r.itemId)).toEqual([ATTRACTOR]);
    expect(matrix.noOfferCount).toBe(1);
  });

  test('rows sort in CSF canonical function order, not input or alphabetical order', () => {
    // Input deliberately reversed: DE first, PR last. All three are known
    // offer-bearing subcategories (session-start measurement).
    const matrix = buildEnvironmentMatrix(['DE.CM-01', ATTRACTOR, 'PR.AA-05'], BOTH);
    const ids = matrix.rows.map((r) => r.itemId);
    // PR before DE is canonical CSF function order and the opposite of both
    // the input order and alphabetical order ('DE' < 'PR').
    expect(ids).toEqual(['PR.AA-05', ATTRACTOR, 'DE.CM-01']);
    expect(ids).toEqual([...ids].sort(compareCsfOrder));
    // Unknown function prefixes rank after every canonical CSF function.
    expect(compareCsfOrder('ZZ.XX-01', 'RC.RP-01')).toBeGreaterThan(0);
    expect(compareCsfOrder('GV.OC-01', 'ZZ.XX-01')).toBeLessThan(0);
  });

  test('totals and totalAvailable sum the cells exactly', () => {
    const matrix = buildEnvironmentMatrix([ATTRACTOR, 'DE.CM-01'], BOTH);
    const cellSum = matrix.rows.reduce(
      (n, r) => n + Object.values(r.cells).reduce((m, c) => m + c, 0), 0
    );
    expect(matrix.totalAvailable).toBe(cellSum);
    expect(matrix.totalAvailable).toBe(
      Object.values(matrix.totals).reduce((n, c) => n + c, 0)
    );
  });

  test('REGRESSION: implementation-example scope ids ("PR.DS-10 Ex1") resolve to subcategory offers', () => {
    // Real wizard scope ids carry the Ex suffix; the platform map keys on the
    // bare subcategory. Caught live in the Interceptor click-through when the
    // bare-id unit fixtures all passed while the real wizard matrix was empty.
    const matrix = buildEnvironmentMatrix([`${ATTRACTOR} Ex1`], BOTH);
    expect(matrix.rows).toHaveLength(1);
    expect(matrix.rows[0].itemId).toBe(`${ATTRACTOR} Ex1`);
    expect(matrix.rows[0].cells['google-workspace'] + matrix.rows[0].cells['microsoft-365']).toBe(122);
  });

  test('empty platforms or empty scope produce an empty matrix, no throw', () => {
    expect(buildEnvironmentMatrix([], BOTH).rows).toEqual([]);
    expect(buildEnvironmentMatrix([ATTRACTOR], []).rows).toEqual([]);
    expect(buildEnvironmentMatrix(null, null).rows).toEqual([]);
  });
});

describe('selection helpers', () => {
  const matrix = buildEnvironmentMatrix([ATTRACTOR, 'DE.CM-01', 'PR.AA-05'], BOTH);

  test('toggleCell is a pure on/off with no side effects on other cells', () => {
    const on = toggleCell({}, ATTRACTOR, 'google-workspace');
    expect(on[cellKey(ATTRACTOR, 'google-workspace')]).toBe(true);
    expect(Object.keys(on)).toHaveLength(1);
    const off = toggleCell(on, ATTRACTOR, 'google-workspace');
    expect(off[cellKey(ATTRACTOR, 'google-workspace')]).toBeUndefined();
  });

  test('setColumn selects and clears exactly the platform column', () => {
    const on = setColumn(matrix, {}, 'google-workspace', true);
    expect(columnFullySelected(matrix, on, 'google-workspace')).toBe(true);
    expect(columnFullySelected(matrix, on, 'microsoft-365')).toBe(false);
    expect(countAttached(matrix, on)).toBe(columnTotal(matrix, 'google-workspace'));
    const off = setColumn(matrix, on, 'google-workspace', false);
    expect(countAttached(matrix, off)).toBe(0);
  });

  test('countAttached and attachedCountForItem agree with the cell arithmetic', () => {
    const selections = toggleCell({}, ATTRACTOR, 'microsoft-365');
    const row = matrix.rows.find((r) => r.itemId === ATTRACTOR);
    expect(countAttached(matrix, selections)).toBe(row.cells['microsoft-365']);
    expect(attachedCountForItem(matrix, selections, ATTRACTOR)).toBe(row.cells['microsoft-365']);
    expect(attachedCountForItem(matrix, selections, 'DE.CM-01')).toBe(0);
  });
});

describe('buildAttachPlan', () => {
  test('a checked cell attaches ALL of that cell offers — the attractor keeps every one of its 122 (no silent cap)', () => {
    const selections = {
      [cellKey(ATTRACTOR, 'google-workspace')]: true,
      [cellKey(ATTRACTOR, 'microsoft-365')]: true
    };
    const plan = buildAttachPlan([ATTRACTOR], selections, BOTH, true);
    expect(plan.offersByItem[ATTRACTOR]).toHaveLength(122);
    // Byte-level identity with the production offer source, order included:
    expect(plan.offersByItem[ATTRACTOR]).toEqual(getPlatformProcedures(ATTRACTOR, BOTH));
  });

  test('an unchecked platform is excluded by USER cell state only', () => {
    const selections = { [cellKey(ATTRACTOR, 'google-workspace')]: true };
    const plan = buildAttachPlan([ATTRACTOR], selections, BOTH, true);
    expect(plan.offersByItem[ATTRACTOR]).toEqual(
      getPlatformProcedures(ATTRACTOR, ['google-workspace'])
    );
    plan.offersByItem[ATTRACTOR].forEach((o) => {
      expect(o.record.platform).toBe('google-workspace');
    });
  });

  test('persisted platforms are DERIVED from attached offers, never chip state', () => {
    // Both chips on, but the user only checked one GWS cell: the assessment
    // must declare only google-workspace. Zero checks declare nothing.
    const selections = { [cellKey(ATTRACTOR, 'google-workspace')]: true };
    expect(buildAttachPlan([ATTRACTOR], selections, BOTH, true).platforms).toEqual(['google-workspace']);
    expect(buildAttachPlan([ATTRACTOR], {}, BOTH, true).platforms).toEqual([]);
  });

  test('REGRESSION: attach plan resolves Ex-suffixed scope ids and keys offers by the raw item id', () => {
    const itemId = `${ATTRACTOR} Ex1`;
    const selections = {
      [cellKey(itemId, 'google-workspace')]: true,
      [cellKey(itemId, 'microsoft-365')]: true
    };
    const plan = buildAttachPlan([itemId], selections, BOTH, true);
    expect(plan.offersByItem[itemId]).toEqual(getPlatformProcedures(ATTRACTOR, BOTH));
    expect(plan.platforms).toEqual(['google-workspace', 'microsoft-365']);
  });

  test('a checked cell for a DE-CHIPPED platform is a ghost — never attaches (analyzer adoption)', () => {
    // User checks M365 cells, then toggles the M365 chip off: the stale
    // selection keys stay in state, but the plan must intersect with the
    // CURRENT platform list. A refactor iterating Object.keys(selections)
    // would resurrect ghost attaches and fail here.
    const selections = { [cellKey(ATTRACTOR, 'microsoft-365')]: true };
    const plan = buildAttachPlan([ATTRACTOR], selections, ['google-workspace'], true);
    expect(plan.offersByItem).toEqual({});
    expect(plan.platforms).toEqual([]);
  });

  test('bank disabled or item uncovered attaches nothing regardless of cells', () => {
    const selections = { [cellKey(ATTRACTOR, 'google-workspace')]: true };
    const noBank = buildAttachPlan([ATTRACTOR], selections, BOTH, false);
    expect(noBank.offersByItem).toEqual({});
    expect(noBank.platforms).toEqual([]);
  });

  test('unranked passthrough: offers keep committed-map order (no sorting or scoring anywhere)', () => {
    const selections = setColumn(
      buildEnvironmentMatrix(['DE.CM-01'], BOTH), {}, 'google-workspace', true
    );
    const plan = buildAttachPlan(['DE.CM-01'], selections, BOTH, true);
    expect(plan.offersByItem['DE.CM-01'].map((o) => o.policyId)).toEqual(
      getPlatformProcedures('DE.CM-01', ['google-workspace']).map((o) => o.policyId)
    );
  });
});

describe('environmentAttachCopy', () => {
  test('bank on, plural: byte-matches the shipped step-3 sentence', () => {
    expect(environmentAttachCopy(true, 493, 493)).toEqual({
      active: true,
      text: '493 platform checks from the Environment step attach as addenda (493 available).'
    });
  });

  test('bank on, singular: attaches/check agreement preserved', () => {
    expect(environmentAttachCopy(true, 1, 12)).toEqual({
      active: true,
      text: '1 platform check from the Environment step attaches as addenda (12 available).'
    });
  });

  test('bank on, zero attached: still an honest active sentence', () => {
    expect(environmentAttachCopy(true, 0, 493).text).toBe(
      '0 platform checks from the Environment step attach as addenda (493 available).'
    );
  });

  test('bank OFF with selections: inactive warning, never an attach claim', () => {
    const copy = environmentAttachCopy(false, 493, 493);
    expect(copy.active).toBe(false);
    expect(copy.text).toContain('will not attach');
    expect(copy.text).not.toContain('attach as addenda');
  });

  test('bank OFF, singular selection keeps noun agreement', () => {
    expect(environmentAttachCopy(false, 1, 12).text).toContain('1 platform check selected');
  });

  test('bank OFF with nothing selected renders nothing', () => {
    expect(environmentAttachCopy(false, 0, 493)).toBeNull();
  });
});
