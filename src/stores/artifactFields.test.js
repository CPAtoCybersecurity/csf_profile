/**
 * Issue #306 — Artifact Name rename, Health, Last Updated, Artifact ID,
 * Control ID.
 *
 * The Jira AR export is asserted UNCHANGED: 'Summary' is a foreign contract
 * (Jira's own import column), not this app's column to rename.
 */

import useArtifactStore, {
  ARTIFACT_HEALTH_VALUES,
  migrateArtifactsState,
  normalizeArtifactFields
} from './artifactStore';

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

describe('addArtifact stamps health', () => {
  beforeEach(resetStore);

  it('defaults health to "not set" rather than claiming Healthy', () => {
    const id = useArtifactStore.getState().addArtifact({ name: 'New evidence' });
    expect(useArtifactStore.getState().getArtifactById(id).health).toBe('');
  });

  it('keeps a supplied health value', () => {
    const id = useArtifactStore.getState().addArtifact({ name: 'Reviewed', health: 'Needs Remediation' });
    expect(useArtifactStore.getState().getArtifactById(id).health).toBe('Needs Remediation');
  });

  it('exposes exactly the two documented health values', () => {
    expect(ARTIFACT_HEALTH_VALUES).toEqual(['Healthy', 'Needs Remediation']);
  });
});

describe('normalizeArtifactFields', () => {
  it('adds health to a pre-#306 record', () => {
    const state = normalizeArtifactFields({
      artifacts: [{ artifactId: 'AR-1', name: 'Old', lastModified: '2025-01-01T00:00:00.000Z' }]
    });
    expect(state.artifacts[0].health).toBe('');
  });

  it('falls lastModified back to createdDate, not to now', () => {
    const state = normalizeArtifactFields({
      artifacts: [{ artifactId: 'AR-2', name: 'Old', createdDate: '2024-06-01T00:00:00.000Z' }]
    });
    expect(state.artifacts[0].lastModified).toBe('2024-06-01T00:00:00.000Z');
  });

  it('never overwrites an existing health value', () => {
    const state = normalizeArtifactFields({
      artifacts: [{ artifactId: 'AR-3', health: 'Healthy', lastModified: '2025-01-01T00:00:00.000Z' }]
    });
    expect(state.artifacts[0].health).toBe('Healthy');
  });

  it('is idempotent — a second pass returns the same state object', () => {
    const once = normalizeArtifactFields({ artifacts: [{ artifactId: 'AR-4' }] });
    const twice = normalizeArtifactFields(once);
    expect(twice).toBe(once);
  });

  it('is idempotent for a record that has a createdDate to fall back to', () => {
    const once = normalizeArtifactFields({
      artifacts: [{ artifactId: 'AR-5', createdDate: '2024-01-01T00:00:00.000Z' }]
    });
    expect(once.artifacts[0].lastModified).toBe('2024-01-01T00:00:00.000Z');
    expect(normalizeArtifactFields(once)).toBe(once);
  });

  it('heals a record whose lastModified was blanked but has a createdDate', () => {
    const state = normalizeArtifactFields({
      artifacts: [{ artifactId: 'AR-6', lastModified: '', createdDate: '2024-02-02T00:00:00.000Z' }]
    });
    expect(state.artifacts[0].lastModified).toBe('2024-02-02T00:00:00.000Z');
  });

  it('leaves a non-array state untouched', () => {
    expect(normalizeArtifactFields({ artifacts: null })).toEqual({ artifacts: null });
  });
});

describe('migrateArtifactsState runs the #306 pass', () => {
  it('normalizes a v8 state that skips every version branch', () => {
    const migrated = migrateArtifactsState(
      { artifacts: [{ artifactId: 'AR-V8', name: 'Kept', createdDate: '2025-02-02T00:00:00.000Z' }] },
      8
    );
    expect(migrated.artifacts[0].health).toBe('');
    expect(migrated.artifacts[0].lastModified).toBe('2025-02-02T00:00:00.000Z');
  });
});

describe('standard artifact CSV', () => {
  beforeEach(resetStore);

  it('exports Artifact Name, Status, Health and Last Updated', () => {
    useArtifactStore.getState().addArtifact({
      artifactId: 'AR-10',
      name: 'Access Review Q1',
      health: 'Healthy',
      status: 'ACTIVE',
      controlId: 'CTL-001'
    });

    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV());

    expect(csv).toContain('Artifact Name');
    expect(csv).not.toMatch(/(^|,)"?Name"?,/);
    expect(csv).toContain('Health');
    expect(csv).toContain('Last Updated');
    expect(csv).toContain('Access Review Q1');
    expect(csv).toContain('Healthy');
    expect(csv).toContain('CTL-001');
  });

  it('imports the new header and still accepts the legacy ones', async () => {
    const store = useArtifactStore.getState();
    await store.importArtifactsCSV(
      'Artifact ID,Artifact Name,Health,Last Updated\nAR-20,Named By New Header,Needs Remediation,2025-03-03T00:00:00.000Z'
    );
    await store.importArtifactsCSV('Artifact ID,Name\nAR-21,Named By Legacy Header');
    await store.importArtifactsCSV('Artifact ID,Summary\nAR-22,Named By Jira Header');

    const byId = (id) => useArtifactStore.getState().getArtifactByArtifactId(id);
    expect(byId('AR-20').name).toBe('Named By New Header');
    expect(byId('AR-20').health).toBe('Needs Remediation');
    expect(byId('AR-20').lastModified).toBe('2025-03-03T00:00:00.000Z');
    expect(byId('AR-21').name).toBe('Named By Legacy Header');
    expect(byId('AR-22').name).toBe('Named By Jira Header');
  });

  it('stamps now when the Last Updated column is absent', async () => {
    await useArtifactStore.getState().importArtifactsCSV('Artifact ID,Artifact Name\nAR-30,No Date');
    const imported = useArtifactStore.getState().getArtifactByArtifactId('AR-30');
    expect(Number.isNaN(new Date(imported.lastModified).getTime())).toBe(false);
  });

  it('leaves health blank when the column is absent', async () => {
    await useArtifactStore.getState().importArtifactsCSV('Artifact ID,Artifact Name\nAR-31,No Health');
    expect(useArtifactStore.getState().getArtifactByArtifactId('AR-31').health).toBe('');
  });
});

describe('CSV injection through the round-tripped columns', () => {
  beforeEach(resetStore);

  // Issue #306 made 'Last Updated' round-trip, which turned a store-stamped
  // timestamp into a user-controlled value: a crafted CSV puts a formula in
  // the cell, import stores it verbatim, and export writes it back out. Every
  // importable column must go through escapeCSVValue.
  it('neutralizes a formula smuggled in through an imported column', async () => {
    await useArtifactStore.getState().importArtifactsCSV(
      'Artifact ID,Artifact Name,Last Updated,Created Date\nAR-50,Evil,=cmd|calc,@SUM(1)'
    );

    const csv = captureCSV(() => useArtifactStore.getState().exportArtifactsCSV());

    // Escaped form is a leading apostrophe, so no cell starts with = or @.
    expect(csv).not.toMatch(/(^|,)=cmd/);
    expect(csv).not.toMatch(/(^|,)@SUM/);
    expect(csv).toContain("'=cmd|calc");
    expect(csv).toContain("'@SUM(1)");
  });
});

describe('Jira AR export is a foreign contract', () => {
  beforeEach(resetStore);

  it('still emits Summary, not Artifact Name', () => {
    useArtifactStore.getState().addArtifact({ artifactId: 'AR-40', name: 'Jira shaped' });
    const csv = captureCSV(() => useArtifactStore.getState().exportForJiraCSV());

    expect(csv).toContain('Summary');
    expect(csv).toContain('Project key');
    expect(csv).not.toContain('Artifact Name');
  });
});
