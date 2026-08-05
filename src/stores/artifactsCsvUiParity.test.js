/**
 * Artifacts CSV ↔ Key details panel parity (2026-08-04).
 *
 * `assigneeId` and `reporterId` were editable in the detail panel AND shown as
 * list columns, yet appeared in neither the CSV nor the share registry — the
 * fail-open class. An export → import round trip erased both. `type` was the
 * mirror-image defect: in the CSV and on 65 seeded records, but with no panel
 * surface at all.
 *
 * The Jira AR export is asserted UNCHANGED: 'Summary' is Jira's own import
 * column, a foreign contract, not this app's to rename.
 */

import useArtifactStore, {
  ARTIFACT_CSV_HEADERS,
  ARTIFACT_TYPE_VALUES
} from './artifactStore';
import useUserStore from './userStore';

const resetStore = () => useArtifactStore.setState({ artifacts: [] });

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

describe('ARTIFACT_CSV_HEADERS is the single canonical column list', () => {
  it('carries every field the Key details / Details panel shows', () => {
    ['Artifact ID', 'Artifact Name', 'Type', 'Status', 'Health', 'Priority',
      'Control ID', 'Assessment ID', 'Artifact Link', 'External Ticket Link',
      'Ticket ID', 'Description', 'Linked Subcategories', 'Assignee',
      'Reporter', 'Last Updated'
    ].forEach((header) => {
      expect(ARTIFACT_CSV_HEADERS).toContain(header);
    });
  });

  it('keeps the legacy linkage columns rather than destroying them', () => {
    expect(ARTIFACT_CSV_HEADERS).toContain('Linked Evaluation IDs');
    expect(ARTIFACT_CSV_HEADERS).toContain('Compliance Requirement');
  });

  it('offers a type vocabulary that covers the shipped seed values', () => {
    ['Document', 'Policy', 'Procedure', 'Report', 'Evidence', 'Screenshot', 'Diagram']
      .forEach((value) => expect(ARTIFACT_TYPE_VALUES).toContain(value));
  });
});

describe('exportArtifactsCSV emits exactly the canonical columns', () => {
  beforeEach(resetStore);

  it('writes the header list verbatim and in order', () => {
    useArtifactStore.getState().addArtifact({ artifactId: 'AR-1', name: 'Evidence' });
    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV(useUserStore));
    expect(headerLine(csv)).toBe(ARTIFACT_CSV_HEADERS.join(','));
  });

  it('serializes assignee and reporter as Name <email>', () => {
    useUserStore.setState({
      users: [
        { id: 'u-1', name: 'Owner Name', email: 'owner@example.com' },
        { id: 'u-2', name: 'Auditor Name', email: 'auditor@example.com' }
      ]
    });
    useArtifactStore.getState().addArtifact({
      artifactId: 'AR-2', name: 'Access review', assigneeId: 'u-1', reporterId: 'u-2'
    });

    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV(useUserStore));
    expect(csv).toContain('Owner Name <owner@example.com>');
    expect(csv).toContain('Auditor Name <auditor@example.com>');
  });

  it('falls back to the raw id rather than emptying the cell when the roster is unknown', () => {
    useUserStore.setState({ users: [] });
    useArtifactStore.getState().addArtifact({
      artifactId: 'AR-3', name: 'Orphan owner', assigneeId: 'u-missing'
    });
    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV(useUserStore));
    expect(csv).toContain('u-missing');
  });
});

describe('round trip: export → import preserves the Key details fields', () => {
  beforeEach(() => {
    resetStore();
    useUserStore.setState({ users: [{ id: 'u-1', name: 'Owner Name', email: 'owner@example.com' }] });
  });

  it('restores assignee, reporter, type and health', async () => {
    useArtifactStore.getState().addArtifact({
      artifactId: 'AR-10',
      name: 'Quarterly Access Review Report',
      type: 'Report',
      health: 'Needs Remediation',
      assigneeId: 'u-1',
      reporterId: 'u-1'
    });

    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV(useUserStore));
    resetStore();
    await useArtifactStore.getState().importArtifactsCSV(csv, useUserStore);

    const [restored] = useArtifactStore.getState().artifacts;
    expect(restored.type).toBe('Report');
    expect(restored.health).toBe('Needs Remediation');
    expect(restored.assigneeId).toBe('u-1');
    expect(restored.reporterId).toBe('u-1');
  });
});

describe('backward compatibility', () => {
  beforeEach(resetStore);

  it('importArtifactsCSV still works when no userStore is supplied', async () => {
    const added = await useArtifactStore.getState().importArtifactsCSV(
      'Artifact ID,Artifact Name,Assignee\nAR-20,No roster,Owner Name <owner@example.com>'
    );
    expect(added).toBe(1);
    const [artifact] = useArtifactStore.getState().artifacts;
    expect(artifact.name).toBe('No roster');
    expect(artifact.assigneeId).toBeNull();
  });

  it('exportArtifactsCSV still works when no userStore is supplied', () => {
    useArtifactStore.getState().addArtifact({ artifactId: 'AR-21', name: 'No roster export' });
    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV());
    expect(headerLine(csv)).toBe(ARTIFACT_CSV_HEADERS.join(','));
  });

  it('leaves the Jira AR export shape untouched', () => {
    useArtifactStore.getState().addArtifact({ artifactId: 'AR-22', name: 'Jira row' });
    const csv = captureCSV(() => useArtifactStore.getState().exportForJiraCSV());
    expect(headerLine(csv)).toContain('Summary');
    expect(headerLine(csv)).toContain('Project key');
  });
});
