/**
 * Issue #306 — Control Name / Status / Tests / Frameworks.
 *
 * Covers the store surface: the create default, the persist migration, and the
 * CSV/JSON round-trip. The migration is exercised through the EXACT production
 * entry point (migrateControlsState), not a hand-rolled copy of it.
 */

import useControlsStore, {
  CONTROL_STATUSES,
  migrateControlsState,
  normalizeControlFields
} from './controlsStore';

const resetStore = () => {
  useControlsStore.setState({ controls: [], history: [], historyIndex: -1 });
};

describe('createControl stamps the issue #306 fields', () => {
  beforeEach(resetStore);

  it('defaults name, tests and frameworks to empty strings', () => {
    const created = useControlsStore.getState().createControl({ controlId: 'CTL-900' });
    expect(created.name).toBe('');
    expect(created.tests).toBe('');
    expect(created.frameworks).toBe('');
  });

  it('defaults status to the first documented status', () => {
    const created = useControlsStore.getState().createControl({ controlId: 'CTL-901' });
    expect(created.status).toBe(CONTROL_STATUSES[0]);
    expect(CONTROL_STATUSES[0]).toBe('Not Implemented');
  });

  it('keeps the values the caller supplied', () => {
    const created = useControlsStore.getState().createControl({
      controlId: 'CTL-902',
      name: 'Quarterly Access Review',
      status: 'Implemented',
      tests: 'Sample 25 accounts',
      frameworks: 'NIST CSF 2.0; SOC 2'
    });
    expect(created.name).toBe('Quarterly Access Review');
    expect(created.status).toBe('Implemented');
    expect(created.tests).toBe('Sample 25 accounts');
    expect(created.frameworks).toBe('NIST CSF 2.0; SOC 2');
  });
});

describe('updateControl sanitizes every free-text field', () => {
  beforeEach(resetStore);

  it('writes name/tests/frameworks and leaves untouched fields alone', () => {
    useControlsStore.getState().createControl({ controlId: 'CTL-903', name: 'Original' });
    useControlsStore.getState().updateControl('CTL-903', { tests: 'Walk the log' });

    const control = useControlsStore.getState().getControl('CTL-903');
    expect(control.tests).toBe('Walk the log');
    // A partial update must not blank the field it did not mention.
    expect(control.name).toBe('Original');
  });
});

describe('the new free-text fields survive angle brackets', () => {
  beforeEach(resetStore);

  // Regression: these fields used to run through sanitizeInput (DOMPurify with
  // ALLOWED_TAGS: []), which DELETES angle-bracket content. The panel writes on
  // every keystroke against a controlled input, so an escalation address
  // vanished as the user typed it — and `Name <email>` is this app's own owner
  // convention, so it is exactly what a Tests plan will contain.
  const WITH_EMAIL = 'Escalate exceptions to <soc@example.com> weekly';

  it('keeps an <email> written through createControl', () => {
    const created = useControlsStore.getState().createControl({
      controlId: 'CTL-400',
      name: 'Review <owner@example.com>',
      tests: WITH_EMAIL,
      frameworks: 'CSF 2.0 <internal>'
    });
    expect(created.tests).toBe(WITH_EMAIL);
    expect(created.name).toBe('Review <owner@example.com>');
    expect(created.frameworks).toBe('CSF 2.0 <internal>');
  });

  it('keeps an <email> written through updateControl', () => {
    useControlsStore.getState().createControl({ controlId: 'CTL-401' });
    useControlsStore.getState().updateControl('CTL-401', { tests: WITH_EMAIL });
    expect(useControlsStore.getState().getControl('CTL-401').tests).toBe(WITH_EMAIL);
  });

  it('keeps a less-than sign intact rather than entity-encoding it', () => {
    useControlsStore.getState().createControl({ controlId: 'CTL-402' });
    useControlsStore.getState().updateControl('CTL-402', { tests: 'sample size < 25 accounts' });
    expect(useControlsStore.getState().getControl('CTL-402').tests).toBe('sample size < 25 accounts');
  });

  it('keeps an <email> through a CSV import', async () => {
    await useControlsStore.getState().importControlsCSV(
      `Control ID,Tests\nCTL-403,"${WITH_EMAIL}"`,
      null
    );
    expect(useControlsStore.getState().getControl('CTL-403').tests).toBe(WITH_EMAIL);
  });
});

describe('normalizeControlFields', () => {
  it('fills the missing fields on a pre-#306 record', () => {
    const state = normalizeControlFields({
      controls: [{ controlId: 'CTL-OLD', implementationDescription: 'legacy' }]
    });
    expect(state.controls[0]).toMatchObject({
      name: '',
      tests: '',
      frameworks: '',
      status: CONTROL_STATUSES[0]
    });
  });

  it('never overwrites a value the record already carries', () => {
    const state = normalizeControlFields({
      controls: [{
        controlId: 'CTL-SET',
        name: 'Kept',
        tests: 'Kept tests',
        frameworks: 'Kept frameworks',
        status: 'Implemented'
      }]
    });
    expect(state.controls[0]).toMatchObject({
      name: 'Kept',
      tests: 'Kept tests',
      frameworks: 'Kept frameworks',
      status: 'Implemented'
    });
  });

  it('treats a deliberately empty string as a value, not as absent', () => {
    const state = normalizeControlFields({
      controls: [{ controlId: 'CTL-BLANK', name: '', tests: '', frameworks: '', status: 'Implemented' }]
    });
    // Nothing changed → the SAME object comes back.
    expect(state.controls[0].status).toBe('Implemented');
  });

  it('is idempotent — a second pass returns the same state object', () => {
    const once = normalizeControlFields({ controls: [{ controlId: 'CTL-OLD' }] });
    const twice = normalizeControlFields(once);
    expect(twice).toBe(once);
  });

  it('leaves a non-array state untouched', () => {
    expect(normalizeControlFields(undefined)).toBeUndefined();
    expect(normalizeControlFields({ controls: null })).toEqual({ controls: null });
  });
});

describe('migrateControlsState runs the #306 pass on every upgrade path', () => {
  it('normalizes a v4 state that takes the early seeding branch', () => {
    const migrated = migrateControlsState({ controls: [{ controlId: 'CTL-V4' }] }, 4);
    expect(migrated.controls[0]).toMatchObject({ name: '', tests: '', frameworks: '' });
  });

  it('normalizes a v6 state that skips every version branch', () => {
    const migrated = migrateControlsState({ controls: [{ controlId: 'CTL-V6' }] }, 6);
    expect(migrated.controls[0]).toMatchObject({
      name: '',
      tests: '',
      frameworks: '',
      status: CONTROL_STATUSES[0]
    });
  });
});

describe('CSV round-trip carries the issue #306 fields', () => {
  beforeEach(resetStore);

  const CSV = [
    'Control ID,Control Name,Status,Tests,Frameworks,Control Implementation Description,Linked Requirements',
    'CTL-100,Access Review,Implemented,Sample 25 accounts,NIST CSF 2.0; SOC 2,Reviewed quarterly,GV.OC-01-01'
  ].join('\n');

  it('imports all four columns', async () => {
    await useControlsStore.getState().importControlsCSV(CSV, null);
    const control = useControlsStore.getState().getControl('CTL-100');
    expect(control.name).toBe('Access Review');
    expect(control.status).toBe('Implemented');
    expect(control.tests).toBe('Sample 25 accounts');
    expect(control.frameworks).toBe('NIST CSF 2.0; SOC 2');
  });

  it('falls back to the default status when the column is blank', async () => {
    const blank = [
      'Control ID,Control Name,Status',
      'CTL-101,No Status,'
    ].join('\n');
    await useControlsStore.getState().importControlsCSV(blank, null);
    expect(useControlsStore.getState().getControl('CTL-101').status).toBe(CONTROL_STATUSES[0]);
  });

  it('is LOSSLESS for values containing commas, apostrophes and quotes', async () => {
    // Regression: escapeCSVValue wraps-and-quotes, and Papa.unparse quotes
    // again, so a re-imported value came back carrying literal " characters
    // that grew by two on every cycle. An apostrophe alone was enough.
    const tricky = {
      controlId: 'CTL-300',
      name: 'Vendor, Third-Party Reviews',
      tests: "Sam's quarterly review",
      frameworks: 'ISO 27001, "Annex A"',
      status: 'Implemented'
    };

    const captured = [];
    const originalBlob = global.Blob;
    global.Blob = function MockBlob(parts) { captured.push(parts.join('')); return { parts }; };
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    useControlsStore.getState().createControl(tricky);
    useControlsStore.getState().exportControlsCSV(null);
    global.Blob = originalBlob;

    // Feed the exported file straight back into the importer.
    await useControlsStore.getState().importControlsCSV(captured.join(''), null);
    const back = useControlsStore.getState().getControl('CTL-300');

    expect(back.name).toBe(tricky.name);
    expect(back.tests).toBe(tricky.tests);
    expect(back.frameworks).toBe(tricky.frameworks);
    expect(back.status).toBe('Implemented');
  });

  it('still neutralizes a formula while staying lossless', async () => {
    const captured = [];
    const originalBlob = global.Blob;
    global.Blob = function MockBlob(parts) { captured.push(parts.join('')); return { parts }; };
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    useControlsStore.getState().createControl({ controlId: 'CTL-301', name: '=cmd|calc' });
    useControlsStore.getState().exportControlsCSV(null);
    global.Blob = originalBlob;

    const csv = captured.join('');
    expect(csv).not.toMatch(/(^|,)=cmd/);
    expect(csv).toContain("'=cmd|calc");
  });

  it('guards EVERY importable column, including the joined id lists', async () => {
    // A crafted CSV can seed a formula into any column the importer reads
    // back, not just the obvious prose ones.
    await useControlsStore.getState().importControlsCSV(
      'Control ID,Linked Requirements,Stakeholder IDs\nCTL-302,=cmd|calc,@SUM(1)',
      null
    );

    const captured = [];
    const originalBlob = global.Blob;
    global.Blob = function MockBlob(parts) { captured.push(parts.join('')); return { parts }; };
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();
    useControlsStore.getState().exportControlsCSV(null);
    global.Blob = originalBlob;

    const csv = captured.join('');
    expect(csv).not.toMatch(/(^|,)=cmd/);
    expect(csv).not.toMatch(/(^|,)@SUM/);
  });

  it('exports the four columns (regression: status used to be dropped on import)', () => {
    const captured = [];
    const originalBlob = global.Blob;
    global.Blob = function MockBlob(parts) { captured.push(parts.join('')); return { parts }; };
    global.URL.createObjectURL = jest.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = jest.fn();

    useControlsStore.getState().createControl({
      controlId: 'CTL-200',
      name: 'Exported Control',
      status: 'Partially Implemented',
      tests: 'Inspect the ticket',
      frameworks: 'ISO 27001'
    });
    useControlsStore.getState().exportControlsCSV(null);

    global.Blob = originalBlob;

    const csv = captured.join('');
    expect(csv).toContain('Control Name');
    expect(csv).toContain('Tests');
    expect(csv).toContain('Frameworks');
    expect(csv).toContain('Exported Control');
    expect(csv).toContain('Partially Implemented');
    expect(csv).toContain('ISO 27001');
  });
});
