/**
 * The `Implementation Example` column on the assessment CSV egresses.
 *
 * The `ID` column is the export's primary key and carries a bare requirement
 * id (`GV.SC-04 Ex1`) — opaque on its own. This column joins the framework's
 * example text in on that key so an exported assessment is readable without a
 * second lookup, matching the reference workbook in GET_THE_SPREADSHEETS/.
 *
 * Four things are load-bearing and each gets its own test, so a mutant that
 * breaks one fails here rather than in a user's spreadsheet:
 *   1. the column exists and sits immediately after `ID` in BOTH exporters;
 *   2. it resolves from requirementsStore, and is EMPTY (not a control's
 *      `implementationDescription`) for controls-scoped assessments;
 *   3. the formula guard fires, without the double-quoting that
 *      escapeCSVValue would inflict at a Papa.unparse call site;
 *   4. it is INERT on import — framework text never lands in observation
 *      state, and a file carrying the column imports identically to one
 *      without it.
 *
 * Capture harness mirrors assessmentsStore.egress.test.js: the exporters build
 * a Blob and hand it to URL.createObjectURL, neither of which jsdom
 * implements, so both are stubbed and the CSV is read back from the Blob parts.
 */
import useAssessmentsStore, { ASSESSMENT_CSV_HEADERS } from './assessmentsStore';
import useControlsStore from './controlsStore';
import useRequirementsStore from './requirementsStore';
import useUserStore from './userStore';

const REQ_ID = 'GV.SC-04 Ex1';
const EXAMPLE_TEXT =
  'Ex1: Develop criteria for supplier criticality based on, for example, the sensitivity of data processed, and the importance of the products to the mission';
// Leading `=` is the CSV-injection vector the guard exists to neutralize.
const HOSTILE_ID = 'GV.SC-04 Ex2';
const HOSTILE_TEXT = '=HYPERLINK("http://evil.example","click")';

let captured;
const OriginalBlob = global.Blob;
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

class CapturingBlob extends OriginalBlob {
  constructor(parts, opts) {
    super(parts, opts);
    this.capturedParts = parts;
  }
}

beforeAll(() => {
  global.Blob = CapturingBlob;
  URL.createObjectURL = (blob) => {
    captured.push(blob);
    return 'blob:test';
  };
  URL.revokeObjectURL = () => {};
});

afterAll(() => {
  global.Blob = OriginalBlob;
  URL.createObjectURL = originalCreateObjectURL;
  URL.revokeObjectURL = originalRevokeObjectURL;
});

const capturedText = () => {
  expect(captured.length).toBeGreaterThan(0);
  return captured[captured.length - 1].capturedParts.map((p) => String(p)).join('');
};

/** Split a CSV header line on commas that are not inside double quotes. */
const parseHeaderRow = (csv) => {
  // Papa emits CRLF row terminators; drop the CR so cells compare cleanly.
  const line = csv.split('\n')[0].replace(/\r$/, '');
  const cells = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      cells.push(cell);
      cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells;
};

const createdIds = [];
const makeAssessment = (scopeType, scopeIds) => {
  const store = useAssessmentsStore.getState();
  const created = store.createAssessment({
    name: `Impl example ${scopeType} assessment`,
    scopeType
  });
  createdIds.push(created.id);
  scopeIds.forEach((id) => store.addToScope(created.id, id));
  return created.id;
};

beforeEach(() => {
  captured = [];
  useRequirementsStore.getState().setRequirements([
    {
      id: REQ_ID,
      frameworkId: 'nist-csf-2.0',
      function: 'GOVERN (GV)',
      category: 'Cybersecurity Supply Chain Risk Management (GV.SC)',
      subcategoryId: 'GV.SC-04',
      subcategoryDescription: 'Suppliers are known and prioritized by criticality',
      implementationExample: EXAMPLE_TEXT,
      inScope: true
    },
    {
      id: HOSTILE_ID,
      frameworkId: 'nist-csf-2.0',
      subcategoryId: 'GV.SC-04',
      implementationExample: HOSTILE_TEXT,
      inScope: true
    }
  ]);
});

afterEach(() => {
  const store = useAssessmentsStore.getState();
  store.setAssessments(store.assessments.filter((a) => !createdIds.includes(a.id)));
  createdIds.length = 0;
  useRequirementsStore.getState().setRequirements([]);
});

describe('column shape', () => {
  test('exportAssessmentCSV places Implementation Example immediately after ID', async () => {
    const id = makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const headers = parseHeaderRow(capturedText());
    expect(headers[0]).toBe('ID');
    expect(headers[1]).toBe('Implementation Example');
  });

  test('exportAllAssessmentsCSV places Implementation Example immediately after ID', async () => {
    makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAllAssessmentsCSV(useControlsStore, useRequirementsStore, useUserStore);

    const headers = parseHeaderRow(capturedText());
    expect(headers[0]).toBe('ID');
    expect(headers[1]).toBe('Implementation Example');
  });

  test('exportAssessmentCSV emits exactly the canonical header list', async () => {
    const id = makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    expect(parseHeaderRow(capturedText())).toEqual(ASSESSMENT_CSV_HEADERS);
  });

  test('exportAllAssessmentsCSV emits exactly the canonical header list', async () => {
    makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAllAssessmentsCSV(useControlsStore, useRequirementsStore, useUserStore);

    expect(parseHeaderRow(capturedText())).toEqual(ASSESSMENT_CSV_HEADERS);
  });
});

describe('the Jira egresses are deliberately excluded', () => {
  // exportForJiraCSV/exportAllForJiraCSV emit a Jira issue-import schema
  // consumed by a machine, not the human-readable workbook schema. Padding
  // every issue with NIST reference prose would bloat descriptions and add a
  // custom field nobody mapped. Pinned as an invariant rather than left as a
  // comment, so the next person adding a column can tell "deliberately
  // excluded" from "missed".
  test('exportForJiraCSV does not gain the column', async () => {
    const id = makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportForJiraCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    expect(parseHeaderRow(csv)).not.toContain('Implementation Example');
    expect(csv).not.toContain(EXAMPLE_TEXT);
  });

  test('exportAllForJiraCSV does not gain the column', async () => {
    makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAllForJiraCSV(useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    expect(parseHeaderRow(csv)).not.toContain('Implementation Example');
    expect(csv).not.toContain(EXAMPLE_TEXT);
  });
});

describe('value resolution', () => {
  test('resolves the requirement implementationExample onto the matching row', async () => {
    const id = makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    expect(csv).toContain(EXAMPLE_TEXT);
  });

  test('emits the text exactly once per row — not double-quoted by escapeCSVValue', async () => {
    const id = makeAssessment('requirements', [REQ_ID]);
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    // escapeCSVValue would have wrapped the value itself, and Papa would then
    // quote the quotes — the tell is a `""` doubling around the cell.
    expect(csv).not.toContain(`""${EXAMPLE_TEXT}""`);
    expect(csv).toContain(`"${EXAMPLE_TEXT}"`);
  });

  test('neutralizes a formula-leading example with the guard prefix', async () => {
    const id = makeAssessment('requirements', [HOSTILE_ID]);
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    // Papa doubles the inner quotes; the guard's leading apostrophe is what
    // stops Excel evaluating the cell, and it must sit before the `=`.
    const papaQuoted = HOSTILE_TEXT.replace(/"/g, '""');
    expect(csv).toContain(`"'${papaQuoted}"`);
    // The raw formula must never open a cell.
    expect(csv).not.toContain(`,${HOSTILE_TEXT}`);
    expect(csv).not.toContain(`,"${papaQuoted}`);
  });

  test('controls-scoped rows get an empty cell, not a control implementationDescription', async () => {
    const controls = useControlsStore.getState();
    const control = controls.createControl({
      controlId: 'CTL-IMPL-EX-1',
      name: 'Supplier criticality control',
      implementationDescription: 'A control implementation description that must NOT be relabelled'
    });
    // Controls are keyed by controlId, not a surrogate id.
    const id = makeAssessment('controls', [control.controlId]);

    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(id, useControlsStore, useRequirementsStore, useUserStore);

    const csv = capturedText();
    expect(csv).not.toContain('must NOT be relabelled');
    // ID cell, then an empty Implementation Example cell.
    expect(csv.split('\n')[1]).toMatch(/^CTL-IMPL-EX-1,,/);

    controls.deleteControl(control.controlId);
  });
});

describe('import treats the column as inert framework data', () => {
  const QUARTER_COLUMNS = ['Q1', 'Q2', 'Q3', 'Q4']
    .flatMap((q) => [
      `${q} Actual Score`,
      `${q} Target Score`,
      `${q} Observations`,
      `${q} Observation Date`,
      `${q} Testing Status`,
      `${q} Examine`,
      `${q} Interview`,
      `${q} Test`
    ]);

  const quarterValues = ['3', '4', 'note', '2025-01-15', 'Complete', 'Yes', 'No', 'Yes'];
  const rowTail = ['Q1', 'Q2', 'Q3', 'Q4'].flatMap(() => quarterValues).join(',');

  const withColumn = [
    `ID,Implementation Example,Assessment,Scope Type,Auditor,Test Procedure(s),${QUARTER_COLUMNS.join(',')}`,
    `${REQ_ID},"${EXAMPLE_TEXT}",Imported Assessment,requirements,Ann Auditor,Review docs,${rowTail}`
  ].join('\n');

  const withoutColumn = [
    `ID,Assessment,Scope Type,Auditor,Test Procedure(s),${QUARTER_COLUMNS.join(',')}`,
    `${REQ_ID},Imported Assessment,requirements,Ann Auditor,Review docs,${rowTail}`
  ].join('\n');

  const importAndTake = async (csv) => {
    const store = useAssessmentsStore.getState();
    const before = new Set(store.assessments.map((a) => a.id));
    await store.importAssessmentsCSV(csv, useUserStore);
    const after = useAssessmentsStore.getState().assessments;
    const imported = after.filter((a) => !before.has(a.id));
    imported.forEach((a) => createdIds.push(a.id));
    expect(imported).toHaveLength(1);
    return imported[0];
  };

  test('a CSV carrying the column imports without throwing', async () => {
    const imported = await importAndTake(withColumn);
    expect(imported.scopeIds).toEqual([REQ_ID]);
  });

  test('observations are identical with and without the column', async () => {
    const a = await importAndTake(withColumn);
    const b = await importAndTake(withoutColumn);
    expect(a.observations).toEqual(b.observations);
  });

  test('the framework text never lands in observation state', async () => {
    const imported = await importAndTake(withColumn);
    const obs = imported.observations[REQ_ID];
    expect(obs).toBeDefined();
    expect(obs).not.toHaveProperty('implementationExample');
    expect(JSON.stringify(obs)).not.toContain('Develop criteria for supplier criticality');
  });

  test('export then import round-trips scopeIds exactly', async () => {
    const sourceId = makeAssessment('requirements', [REQ_ID, HOSTILE_ID]);
    await useAssessmentsStore
      .getState()
      .exportAssessmentCSV(sourceId, useControlsStore, useRequirementsStore, useUserStore);

    const imported = await importAndTake(capturedText());
    const source = useAssessmentsStore.getState().getAssessment(sourceId);
    expect(imported.scopeIds).toEqual(source.scopeIds);
  });
});
