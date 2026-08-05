/**
 * Findings CSV ↔ panel parity (2026-08-04).
 *
 * The Findings detail panel and the findings CSV had drifted: `description`
 * and `externalUrl` were panel-editable but never exported, `lastModified` was
 * shown but never exported, and `evaluationId` was exported despite having no
 * surface in any page or component. This suite pins the column list to the
 * panel and proves the round trip.
 *
 * The Jira FND export is asserted UNCHANGED: 'Summary' / 'Custom field (...)'
 * are Jira's own import columns, a foreign contract, not this app's to rename.
 */

import fs from 'fs';
import path from 'path';
import useFindingsStore, { FINDING_CSV_HEADERS } from './findingsStore';
import useUserStore from './userStore';

const resetStore = () => useFindingsStore.setState({ findings: [] });

const PANEL_SOURCE = fs.readFileSync(
  path.join(__dirname, '..', 'pages', 'Findings.js'),
  'utf8'
);

/**
 * How each CSV column reaches the panel. `label` entries must appear verbatim
 * in Findings.js; the other kinds are surfaces that have no text label (the
 * record header, the title, the two badges) or whose label is computed at
 * runtime from the assessment's tracking config.
 *
 * Adding a column to FINDING_CSV_HEADERS without adding it here fails the
 * suite — that is the point. The previous version of this file hard-coded a
 * copy of the panel's field list, so a column could be added to the sheet with
 * no panel surface and nothing complained. Control ID, Linked Artifacts and
 * the ticket key all drifted that way.
 */
const PANEL_SURFACE = {
  'Finding ID': { kind: 'record-header' },
  'Summary': { kind: 'record-title' },
  'Status': { kind: 'badge' },
  'Priority': { kind: 'badge' },
  'External URL': { kind: 'computed-label' }, // externalUrlLabel(tracking, ...)
  'Name': { kind: 'label', label: 'Name' },
  'Description': { kind: 'label', label: 'Description' },
  'Root Cause': { kind: 'label', label: 'Root Cause' },
  'Remediation Action Plan': { kind: 'label', label: 'Remediation Action Plan' },
  'Assessment ID': { kind: 'label', label: 'Assessment' },
  'Compliance Requirement': { kind: 'label', label: 'Compliance Requirement' },
  'Remediation Owner': { kind: 'label', label: 'Remediation Owner' },
  'Due Date': { kind: 'label', label: 'Due Date' },
  'Created Date': { kind: 'label', label: 'Created' },
  'Last Modified': { kind: 'label', label: 'Last Modified' },
  'Control ID': { kind: 'label', label: 'Control ID' },
  'Linked Artifacts': { kind: 'label', label: 'Linked Artifacts' },
  'Ticket ID': { kind: 'label', label: 'Ticket ID' }
};

/** Panel rows that deliberately have no column: derived, not stored. */
const PANEL_ONLY_LABELS = ['Linked Controls'];

/** Pull every Details-row label out of the real panel source. */
const detailsSectionLabels = () => {
  const start = PANEL_SOURCE.indexOf('{/* Details section */}');
  if (start === -1) throw new Error('Details section marker moved — update this probe');
  const body = PANEL_SOURCE.slice(start);
  const labels = [];
  const re = /className="text-sm text-gray-500[^"]*">([\s\S]*?)<\/span>/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const text = m[1].replace(/<[^>]*\/>/g, '').replace(/\s+/g, ' ').trim();
    if (text && /^[A-Z]/.test(text) && !text.includes('{')) labels.push(text);
  }
  return labels;
};

const captureCSV = (run) => {
  const captured = [];
  const originalBlob = global.Blob;
  global.Blob = function MockBlob(parts) { captured.push(parts.join('')); return { parts }; };
  global.URL.createObjectURL = jest.fn(() => 'blob:mock');
  global.URL.revokeObjectURL = jest.fn();
  try {
    run();
  } finally {
    global.Blob = originalBlob;
  }
  return captured.join('');
};

// Papa.unparse emits CRLF; strip the carriage return before comparing.
const headerLine = (csv) => csv.split('\n')[0].replace(/\r$/, '');

describe('FINDING_CSV_HEADERS is the single canonical column list', () => {
  it('places Name immediately before Description', () => {
    const nameAt = FINDING_CSV_HEADERS.indexOf('Name');
    const descAt = FINDING_CSV_HEADERS.indexOf('Description');
    expect(nameAt).toBeGreaterThan(-1);
    expect(descAt).toBe(nameAt + 1);
  });

  it('declares a panel surface for every column', () => {
    const undeclared = FINDING_CSV_HEADERS.filter(h => !PANEL_SURFACE[h]);
    expect(undeclared).toEqual([]);
  });

  it('has no declared surface for a column that no longer exists', () => {
    const orphaned = Object.keys(PANEL_SURFACE).filter(h => !FINDING_CSV_HEADERS.includes(h));
    expect(orphaned).toEqual([]);
  });

  it('renders each labelled column as a literal label in the panel source', () => {
    // Details rows render as >Label</span>; the prose sections render as an
    // <h3> with an icon, putting the label on its own line.
    const rendersLabel = (label) =>
      PANEL_SOURCE.includes(`>${label}</`) ||
      PANEL_SOURCE.split('\n').some(line => line.trim() === label);

    const missing = Object.entries(PANEL_SURFACE)
      .filter(([, s]) => s.kind === 'label')
      .filter(([, s]) => !rendersLabel(s.label))
      .map(([header]) => header);
    expect(missing).toEqual([]);
  });

  it('has no Details row that the CSV does not carry', () => {
    const mapped = Object.values(PANEL_SURFACE)
      .filter(s => s.kind === 'label')
      .map(s => s.label);
    const unexported = detailsSectionLabels()
      .filter(l => !mapped.includes(l) && !PANEL_ONLY_LABELS.includes(l));
    expect(unexported).toEqual([]);
  });

  it('no longer carries Evaluation ID — no UI surface and no seeded data', () => {
    expect(FINDING_CSV_HEADERS).not.toContain('Evaluation ID');
  });

  it('keeps the linkage columns that carry live data', () => {
    expect(FINDING_CSV_HEADERS).toContain('Control ID');
    expect(FINDING_CSV_HEADERS).toContain('Linked Artifacts');
  });
});

describe('exportFindingsCSV emits exactly the canonical columns', () => {
  beforeEach(resetStore);

  it('writes the header list verbatim and in order', () => {
    useFindingsStore.getState().createFinding({ summary: 'A finding' });
    const csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    expect(headerLine(csv)).toBe(FINDING_CSV_HEADERS.join(','));
  });

  it('exports the panel fields that used to be dropped', () => {
    useFindingsStore.getState().createFinding({
      summary: 'Stale privileged accounts',
      name: 'Stale access',
      description: 'Two of four systems have no review evidence.',
      externalUrl: 'https://example.atlassian.net/browse/SEC-1'
    });
    const csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    expect(csv).toContain('Stale access');
    expect(csv).toContain('Two of four systems have no review evidence.');
    expect(csv).toContain('https://example.atlassian.net/browse/SEC-1');
  });
});

describe('createFinding persists the panel-editable prose fields', () => {
  beforeEach(resetStore);

  it('keeps name', () => {
    const created = useFindingsStore.getState().createFinding({ summary: 'S', name: 'Short name' });
    expect(created.name).toBe('Short name');
  });

  it('keeps description — it was silently discarded on create', () => {
    const created = useFindingsStore.getState().createFinding({ summary: 'S', description: 'Body text' });
    expect(created.description).toBe('Body text');
  });
});

describe('round trip: export → import preserves the new columns', () => {
  beforeEach(() => {
    resetStore();
    useUserStore.setState({ users: [] });
  });

  it('restores name, description and external URL', async () => {
    useFindingsStore.getState().createFinding({
      summary: 'Wire-transfer BEC',
      name: 'BEC exposure',
      description: 'No out-of-band verification on payment changes.',
      externalUrl: 'https://example.com/ticket/9',
      priority: 'Critical'
    });

    const csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    resetStore();
    await useFindingsStore.getState().importFindingsCSV(csv, useUserStore);

    const [restored] = useFindingsStore.getState().findings;
    expect(restored.name).toBe('BEC exposure');
    expect(restored.description).toBe('No out-of-band verification on payment changes.');
    expect(restored.externalUrl).toBe('https://example.com/ticket/9');
    expect(restored.priority).toBe('Critical');
  });

  it('restores the three columns that had no panel surface before 2026-08-05', () => {
    useFindingsStore.getState().createFinding({
      summary: 'Detection gap',
      controlId: 'DE.AE-03 Ex1',
      linkedArtifacts: ['AWS Config Snapshot', 'IAM Policy'],
      jiraKey: 'FND-1001'
    });

    const csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    expect(headerLine(csv)).toContain('Ticket ID');
    expect(headerLine(csv)).not.toContain('Jira Key');

    return useFindingsStore.getState().importFindingsCSV(
      (resetStore(), csv), useUserStore
    ).then(() => {
      const [restored] = useFindingsStore.getState().findings;
      expect(restored.controlId).toBe('DE.AE-03 Ex1');
      expect(restored.linkedArtifacts).toEqual(['AWS Config Snapshot', 'IAM Policy']);
      expect(restored.jiraKey).toBe('FND-1001');
    });
  });

  it('still imports a sheet written when the column was called Jira Key', async () => {
    const legacy = [
      FINDING_CSV_HEADERS.join(',').replace('Ticket ID', 'Jira Key'),
      ['FND-legacy', 'Old sheet', 'Not Started', 'Medium', '', '', '', '', '',
        '', '', '', '', '', '', '', '', 'FND-9999'].join(',')
    ].join('\n');

    await useFindingsStore.getState().importFindingsCSV(legacy, useUserStore);
    const [restored] = useFindingsStore.getState().findings;
    expect(restored.jiraKey).toBe('FND-9999');
  });

  it('does not accumulate quote characters on an apostrophe (csvFormulaGuard, not escapeCSVValue)', async () => {
    useFindingsStore.getState().createFinding({ summary: "Sam's quarterly review" });

    let csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    resetStore();
    await useFindingsStore.getState().importFindingsCSV(csv, useUserStore);
    csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    resetStore();
    await useFindingsStore.getState().importFindingsCSV(csv, useUserStore);

    const [restored] = useFindingsStore.getState().findings;
    expect(restored.summary).toBe("Sam's quarterly review");
  });
});

describe('backward compatibility', () => {
  beforeEach(resetStore);

  it('still reads Evaluation ID from a sheet written before the column was dropped', async () => {
    await useFindingsStore.getState().importFindingsCSV(
      'Finding ID,Summary,Evaluation ID\nFND-9,Legacy row,EVAL-7',
      useUserStore
    );
    expect(useFindingsStore.getState().findings[0].evaluationId).toBe('EVAL-7');
  });

  it('leaves the Jira FND export shape untouched', () => {
    useFindingsStore.getState().createFinding({ summary: 'Jira row' });
    const csv = captureCSV(() => useFindingsStore.getState().exportForJiraCSV(useUserStore));
    expect(headerLine(csv)).toContain('Summary');
    expect(headerLine(csv)).toContain('Project key');
    expect(headerLine(csv)).toContain('Custom field (Evaluation ID)');
  });
});

describe('advisor probes: CSV well-formedness and legacy records', () => {
  beforeEach(() => {
    resetStore();
    useUserStore.setState({ users: [] });
  });

  it('quotes commas, quotes and newlines correctly — csvFormulaGuard leaves quoting to Papa', async () => {
    useFindingsStore.getState().createFinding({
      summary: 'Punctuation stress',
      description: '= a, "b",\nc'
    });

    const csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    resetStore();
    await useFindingsStore.getState().importFindingsCSV(csv, useUserStore);

    const findings = useFindingsStore.getState().findings;
    expect(findings).toHaveLength(1);
    // The leading '=' is the injection guard's apostrophe prefix; everything
    // after it must survive the comma, the quotes and the embedded newline.
    expect(findings[0].description).toContain('a, "b"');
    expect(findings[0].description).toContain('c');
    expect(findings[0].summary).toBe('Punctuation stress');
  });

  it('exports an empty cell — never the string "undefined" — for a record predating the name key', () => {
    useFindingsStore.setState({
      findings: [{ id: 'FND-legacy', summary: 'No name key', status: 'Open', priority: 'Low' }]
    });
    const csv = captureCSV(() => useFindingsStore.getState().exportFindingsCSV(useUserStore));
    expect(csv).not.toContain('undefined');
  });

  it('converges an absent Name column and an empty Name column on the same stored value', async () => {
    await useFindingsStore.getState().importFindingsCSV('Finding ID,Summary\nFND-a,No column', useUserStore);
    await useFindingsStore.getState().importFindingsCSV('Finding ID,Summary,Name\nFND-b,Empty column,', useUserStore);
    const [a, b] = useFindingsStore.getState().findings;
    expect(a.name).toBe(b.name);
  });
});
