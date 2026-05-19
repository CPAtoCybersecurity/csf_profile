/**
 * Tests for dashboard metric pure functions (issue #212).
 * Table-driven coverage of empty-data, single-quarter, tie-breaker, SLA-breach,
 * assessment-switch, all-Medium-priority, and all-Open-status edge cases.
 */
import {
  normalizeStatus,
  normalizePriority,
  extractCategoryId,
  functionFromCategoryId,
  safeNum,
  overallMaturity,
  riskExposure,
  weakestFunction,
  top5Gaps,
  deriveSubcategoryStatus,
  investmentPriorities,
  FUNCTION_WEIGHTS,
  DEFAULT_SLA_DAYS,
} from './dashboardMetrics';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

describe('normalizeStatus', () => {
  test.each([
    ['Open', 'Not Started'],
    ['open', 'Not Started'],
    ['todo', 'Not Started'],
    ['To Do', 'Not Started'],
    ['Not Started', 'Not Started'],
    ['In Progress', 'In Progress'],
    ['in progress', 'In Progress'],
    ['Done', 'Resolved'],
    ['Closed', 'Resolved'],
    ['Resolved', 'Resolved'],
    [null, 'Not Started'],
    [undefined, 'Not Started'],
    ['', 'Not Started'],
    ['Whatever', 'Not Started'],
  ])('maps %p → %p', (input, expected) => {
    expect(normalizeStatus(input)).toBe(expected);
  });
});

describe('normalizePriority', () => {
  test.each([
    ['Critical', 'Critical'],
    ['critical', 'Critical'],
    ['High', 'High'],
    ['high', 'High'],
    ['Medium', 'Medium'],
    ['Low', 'Low'],
    [null, 'Medium'],
    [undefined, 'Medium'],
    ['unknown', 'Medium'],
  ])('maps %p → %p', (input, expected) => {
    expect(normalizePriority(input)).toBe(expected);
  });
});

describe('extractCategoryId', () => {
  test.each([
    ['GV.OC-01 Ex1', 'GV.OC'],
    ['ID.AM-03', 'ID.AM'],
    ['DE.CM-7 Example 4', 'DE.CM'],
    [null, 'Unknown'],
    [undefined, 'Unknown'],
    ['', 'Unknown'],
    ['weird-id', 'weird'],
  ])('extracts %p → %p', (input, expected) => {
    expect(extractCategoryId(input)).toBe(expected);
  });
});

describe('functionFromCategoryId', () => {
  test.each([
    ['GV.OC', 'GOVERN (GV)'],
    ['ID.AM', 'IDENTIFY (ID)'],
    ['PR.AA', 'PROTECT (PR)'],
    ['DE.CM', 'DETECT (DE)'],
    ['RS.AN', 'RESPOND (RS)'],
    ['RC.CO', 'RECOVER (RC)'],
    ['XX.YY', 'Unknown'],
    ['', 'Unknown'],
    [null, 'Unknown'],
  ])('%p → %p', (input, expected) => {
    expect(functionFromCategoryId(input)).toBe(expected);
  });
});

describe('safeNum', () => {
  test.each([
    [5, undefined, 5],
    [0, undefined, 0],
    [null, undefined, '--'],
    [undefined, undefined, '--'],
    [NaN, undefined, '--'],
    [Infinity, undefined, '--'],
    [-Infinity, undefined, '--'],
    ['5', undefined, '--'],
    [null, 0, 0],
  ])('safeNum(%p, %p) → %p', (v, fb, expected) => {
    expect(safeNum(v, fb)).toBe(expected);
  });
});

describe('overallMaturity', () => {
  test('returns nulls for empty data', () => {
    expect(overallMaturity({ dashboardData: [], selectedQuarter: 1 })).toEqual({
      value: null,
      target: null,
      trend: null,
      subtitle: null,
    });
  });

  test('single quarter (Q1) — no trend, returns average', () => {
    const data = [
      { quarters: { Q1: { actualScore: 3, targetScore: 5 } } },
      { quarters: { Q1: { actualScore: 4, targetScore: 5 } } },
    ];
    const out = overallMaturity({ dashboardData: data, selectedQuarter: 1 });
    expect(out.value).toBe(3.5);
    expect(out.target).toBe(5);
    expect(out.trend).toBeNull();
    expect(out.subtitle).toBe('Average actual score, Q1');
  });

  test('Q2 with Q1 prior data — trend up', () => {
    const data = [
      { quarters: { Q1: { actualScore: 2, targetScore: 5 }, Q2: { actualScore: 3, targetScore: 5 } } },
      { quarters: { Q1: { actualScore: 2, targetScore: 5 }, Q2: { actualScore: 3, targetScore: 5 } } },
    ];
    const out = overallMaturity({ dashboardData: data, selectedQuarter: 2 });
    expect(out.value).toBe(3);
    expect(out.trend.direction).toBe('up');
    expect(out.trend.delta).toBe('+1.0');
    expect(out.trend.prevQuarter).toBe('Q1');
  });

  test('Q2 with Q1 prior data — trend down', () => {
    const data = [
      { quarters: { Q1: { actualScore: 4, targetScore: 5 }, Q2: { actualScore: 3, targetScore: 5 } } },
    ];
    const out = overallMaturity({ dashboardData: data, selectedQuarter: 2 });
    expect(out.trend.direction).toBe('down');
    expect(out.trend.delta).toBe('-1.0');
  });

  test('Q2 with equal Q1 data — trend neutral', () => {
    const data = [{ quarters: { Q1: { actualScore: 3 }, Q2: { actualScore: 3 } } }];
    const out = overallMaturity({ dashboardData: data, selectedQuarter: 2 });
    expect(out.trend.direction).toBe('neutral');
  });
});

describe('riskExposure', () => {
  const findings = [
    { assessmentId: 'A1', priority: 'Critical', status: 'Open', createdDate: daysAgo(100) },
    { assessmentId: 'A1', priority: 'High', status: 'In Progress', createdDate: daysAgo(40) },
    { assessmentId: 'A1', priority: 'Medium', status: 'Resolved', createdDate: daysAgo(200) },
    { assessmentId: 'A2', priority: 'Critical', status: 'Open', createdDate: daysAgo(5) },
  ];

  test('empty findings → isEmpty: true', () => {
    expect(riskExposure({ findings: [], assessmentId: 'A1' })).toEqual({
      value: null,
      critCount: 0,
      highCount: 0,
      medLowCount: 0,
      oldestOpenDays: null,
      slaBreached: false,
      isEmpty: true,
    });
  });

  test('no assessmentId → isEmpty: true', () => {
    expect(riskExposure({ findings, assessmentId: null }).isEmpty).toBe(true);
  });

  test('isolates to single assessment (A1)', () => {
    const out = riskExposure({ findings, assessmentId: 'A1' });
    expect(out.value).toBe(1); // only 1 open Critical for A1
    expect(out.critCount).toBe(1);
    expect(out.highCount).toBe(1);
    expect(out.medLowCount).toBe(0); // the Medium is Resolved
    expect(out.isEmpty).toBe(false);
  });

  test('assessment-switch isolation (A2)', () => {
    const out = riskExposure({ findings, assessmentId: 'A2' });
    expect(out.value).toBe(1);
    expect(out.critCount).toBe(1);
    expect(out.highCount).toBe(0);
    expect(out.oldestOpenDays).toBeLessThan(10);
    expect(out.slaBreached).toBe(false);
  });

  test('SLA breach when oldest open > 90 days', () => {
    const out = riskExposure({ findings, assessmentId: 'A1', slaDays: 90 });
    expect(out.oldestOpenDays).toBeGreaterThanOrEqual(99);
    expect(out.slaBreached).toBe(true);
  });

  test('Resolved findings excluded from counts', () => {
    const onlyResolved = [{ assessmentId: 'A1', priority: 'Critical', status: 'Resolved', createdDate: daysAgo(10) }];
    const out = riskExposure({ findings: onlyResolved, assessmentId: 'A1' });
    expect(out.value).toBe(0);
    expect(out.critCount).toBe(0);
    expect(out.oldestOpenDays).toBeNull();
  });

  test('all-Medium-priority findings → medLow > 0, crit/high = 0', () => {
    const allMed = [
      { assessmentId: 'A1', priority: 'Medium', status: 'Open', createdDate: daysAgo(10) },
      { assessmentId: 'A1', priority: 'Medium', status: 'In Progress', createdDate: daysAgo(20) },
    ];
    const out = riskExposure({ findings: allMed, assessmentId: 'A1' });
    expect(out.value).toBe(0);
    expect(out.critCount).toBe(0);
    expect(out.highCount).toBe(0);
    expect(out.medLowCount).toBe(2);
  });
});

describe('weakestFunction', () => {
  test('empty data → null', () => {
    expect(weakestFunction({ pivotTableData: [], selectedQuarter: 1 })).toBeNull();
  });

  test('all functions at target → null', () => {
    const pivot = [
      { name: 'GOVERN (GV)', Q1Actual: 5, Q1Target: 5 },
      { name: 'IDENTIFY (ID)', Q1Actual: 5, Q1Target: 5 },
    ];
    expect(weakestFunction({ pivotTableData: pivot, selectedQuarter: 1 })).toBeNull();
  });

  test('picks function with largest gap', () => {
    const pivot = [
      { name: 'GOVERN (GV)', Q1Actual: 4, Q1Target: 5 },
      { name: 'RESPOND (RS)', Q1Actual: 2, Q1Target: 5 },
      { name: 'DETECT (DE)', Q1Actual: 3, Q1Target: 5 },
    ];
    const out = weakestFunction({ pivotTableData: pivot, selectedQuarter: 1 });
    expect(out.functionCode).toBe('RESPOND (RS)');
    expect(out.actual).toBe(2);
    expect(out.delta).toBe(-3);
    expect(out.tieBreaker).toBeNull();
  });

  test('tie-breaker on equal lowest actual', () => {
    const pivot = [
      { name: 'GOVERN (GV)', Q1Actual: 5, Q1Target: 5 },
      { name: 'RESPOND (RS)', Q1Actual: 2, Q1Target: 5 },
      { name: 'DETECT (DE)', Q1Actual: 2, Q1Target: 5 },
    ];
    const out = weakestFunction({ pivotTableData: pivot, selectedQuarter: 1 });
    expect(out.actual).toBe(2);
    expect(out.tieBreaker).not.toBeNull();
    expect(out.tieBreaker.actual).toBe(2);
  });

  test('skips rows with null actual or target', () => {
    const pivot = [
      { name: 'GOVERN (GV)', Q1Actual: null, Q1Target: null },
      { name: 'RESPOND (RS)', Q1Actual: 2, Q1Target: 5 },
    ];
    const out = weakestFunction({ pivotTableData: pivot, selectedQuarter: 1 });
    expect(out.functionCode).toBe('RESPOND (RS)');
  });
});

describe('top5Gaps', () => {
  test('empty data → []', () => {
    expect(top5Gaps({ subcategoryData: [] })).toEqual([]);
  });

  test('color thresholds: red < target-1.5, amber < target-0.5, green otherwise', () => {
    const data = [
      { categoryId: 'A.A', actualScore: 0, desiredTarget: 5 },   // gap 5 → red
      { categoryId: 'B.B', actualScore: 3.7, desiredTarget: 5 }, // gap 1.3 → amber
      { categoryId: 'C.C', actualScore: 4.7, desiredTarget: 5 }, // gap 0.3 → green
    ];
    const out = top5Gaps({ subcategoryData: data });
    expect(out.length).toBe(3);
    expect(out[0].categoryId).toBe('A.A');
    expect(out[0].color).toBe('red');
    expect(out[1].color).toBe('amber');
    expect(out[2].color).toBe('green');
  });

  test('returns at most 5 rows, sorted descending by gap', () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      categoryId: `X.${i}`,
      actualScore: 0,
      desiredTarget: i + 1,
    }));
    const out = top5Gaps({ subcategoryData: data });
    expect(out.length).toBe(5);
    expect(out[0].gap).toBe(8);
    expect(out[4].gap).toBe(4);
  });

  test('excludes rows where gap ≤ 0', () => {
    const data = [
      { categoryId: 'A.A', actualScore: 5, desiredTarget: 5 }, // gap 0
      { categoryId: 'B.B', actualScore: 6, desiredTarget: 5 }, // gap -1
      { categoryId: 'C.C', actualScore: 2, desiredTarget: 5 }, // gap 3
    ];
    const out = top5Gaps({ subcategoryData: data });
    expect(out.length).toBe(1);
    expect(out[0].categoryId).toBe('C.C');
  });
});

describe('deriveSubcategoryStatus', () => {
  test('empty → NOT STARTED', () => {
    const out = deriveSubcategoryStatus({ linkedFindings: [] });
    expect(out.status).toBe('NOT STARTED');
  });

  test('all-Open findings → NOT STARTED (after normalization)', () => {
    const out = deriveSubcategoryStatus({
      linkedFindings: [
        { status: 'Open', createdDate: daysAgo(5) },
        { status: 'open', createdDate: daysAgo(10) },
      ],
    });
    expect(out.status).toBe('NOT STARTED');
  });

  test('in-progress with age < 60d → IN PROGRESS', () => {
    const out = deriveSubcategoryStatus({
      linkedFindings: [{ status: 'In Progress', createdDate: daysAgo(30) }],
    });
    expect(out.status).toBe('IN PROGRESS');
  });

  test('in-progress with age > 60d → STALLED', () => {
    const out = deriveSubcategoryStatus({
      linkedFindings: [{ status: 'In Progress', createdDate: daysAgo(80) }],
    });
    expect(out.status).toBe('STALLED');
    expect(out.label).toMatch(/STALLED/);
  });

  test('majority Resolved → RESOLVED (n of m)', () => {
    const out = deriveSubcategoryStatus({
      linkedFindings: [
        { status: 'Resolved', createdDate: daysAgo(10) },
        { status: 'Resolved', createdDate: daysAgo(20) },
        { status: 'In Progress', createdDate: daysAgo(5) },
      ],
    });
    expect(out.status).toBe('RESOLVED');
    expect(out.label).toBe('RESOLVED (2 of 3)');
  });
});

describe('investmentPriorities', () => {
  const sub = [
    { categoryId: 'GV.OC', actualScore: 2, desiredTarget: 5 },
    { categoryId: 'ID.AM', actualScore: 4, desiredTarget: 5 },
  ];

  test('empty subcategory data → []', () => {
    expect(investmentPriorities({ subcategoryData: [], findings: [], assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS })).toEqual([]);
  });

  test('ranks by gap × max(priority, fnWeight) × log(1+links)', () => {
    const findings = [
      { id: 'F1', controlId: 'GV.OC-01 Ex1', assessmentId: 'A1', priority: 'High', status: 'Open' },
      { id: 'F2', controlId: 'GV.OC-02 Ex1', assessmentId: 'A1', priority: 'High', status: 'Open' },
      { id: 'F3', controlId: 'ID.AM-01 Ex1', assessmentId: 'A1', priority: 'High', status: 'Open' },
    ];
    const out = investmentPriorities({ subcategoryData: sub, findings, assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    expect(out[0].categoryId).toBe('GV.OC'); // larger gap + more findings
    expect(out[0].rank).toBe(1);
    expect(out[0].linkedFindings).toBe(2);
  });

  test('isolates by assessmentId (no cross-assessment leak)', () => {
    const findings = [
      { id: 'F1', controlId: 'GV.OC-01 Ex1', assessmentId: 'A1', priority: 'Critical', status: 'Open' },
      { id: 'F2', controlId: 'GV.OC-02 Ex1', assessmentId: 'A2', priority: 'Critical', status: 'Open' },
    ];
    const outA1 = investmentPriorities({ subcategoryData: sub, findings, assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    const govOcA1 = outA1.find((r) => r.categoryId === 'GV.OC');
    expect(govOcA1.linkedFindings).toBe(1);
    expect(govOcA1.critCount).toBe(1);
  });

  test('all-Medium priority — function weight floor activates', () => {
    const findings = [
      { id: 'F1', controlId: 'GV.OC-01 Ex1', assessmentId: 'A1', priority: 'Medium', status: 'Open' },
      { id: 'F2', controlId: 'ID.AM-01 Ex1', assessmentId: 'A1', priority: 'Medium', status: 'Open' },
    ];
    const out = investmentPriorities({ subcategoryData: sub, findings, assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    // priorityImpact for Medium = 2; functionWeight for GV.OC = 1.2 → max = 2
    // Both will use priority floor (2), so ranking comes from gap (3 vs 1) × log(2)
    expect(out[0].categoryId).toBe('GV.OC');
    expect(out[0].score).toBeGreaterThan(out[1].score);
  });

  test('priority bump shifts ranking', () => {
    const baseFindings = [
      { id: 'F1', controlId: 'GV.OC-01 Ex1', assessmentId: 'A1', priority: 'Low', status: 'Open' },
      { id: 'F2', controlId: 'ID.AM-01 Ex1', assessmentId: 'A1', priority: 'Low', status: 'Open' },
      { id: 'F3', controlId: 'ID.AM-02 Ex1', assessmentId: 'A1', priority: 'Low', status: 'Open' },
      { id: 'F4', controlId: 'ID.AM-03 Ex1', assessmentId: 'A1', priority: 'Low', status: 'Open' },
    ];
    const before = investmentPriorities({ subcategoryData: sub, findings: baseFindings, assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    const beforeRankGv = before.find((r) => r.categoryId === 'GV.OC').rank;

    const boosted = baseFindings.map((f) =>
      f.id === 'F1' ? { ...f, priority: 'Critical' } : f
    );
    const after = investmentPriorities({ subcategoryData: sub, findings: boosted, assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    const afterRankGv = after.find((r) => r.categoryId === 'GV.OC').rank;
    expect(afterRankGv).toBeLessThanOrEqual(beforeRankGv);
  });

  test('owner pulled from first linked finding', () => {
    const findings = [
      { id: 'F1', controlId: 'GV.OC-01 Ex1', assessmentId: 'A1', priority: 'Medium', status: 'Open', remediationOwner: 5 },
    ];
    const out = investmentPriorities({ subcategoryData: sub, findings, assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    const govOc = out.find((r) => r.categoryId === 'GV.OC');
    expect(govOc.owner).toBe(5);
  });

  test('no linked findings → owner null, status NOT STARTED', () => {
    const out = investmentPriorities({ subcategoryData: sub, findings: [], assessmentId: 'A1', functionWeights: FUNCTION_WEIGHTS });
    expect(out[0].owner).toBeNull();
    expect(out[0].status).toBe('NOT STARTED');
  });
});

describe('DEFAULT_SLA_DAYS', () => {
  test('is 90 days', () => {
    expect(DEFAULT_SLA_DAYS).toBe(90);
  });
});
