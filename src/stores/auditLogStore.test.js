/**
 * auditLogStore extension — record scoping, the field-diff helper, keystroke
 * coalescing, actor attribution (behavioral, via the production path), value
 * truncation, and CSV formula guarding.
 */
import useAuditLogStore, { COALESCE_WINDOW_MS, getActorName } from './auditLogStore';
import useUserStore from './userStore';

const target = { targetType: 'control', targetId: 'CTL-1' };

beforeEach(() => {
  window.localStorage.clear();
  useAuditLogStore.setState({ entries: [] });
  useUserStore.setState({ users: [{ id: 7, name: 'Nadia.Khan', email: 'n@x.com' }], currentUserId: null });
});

describe('addEntry + record scoping', () => {
  test('persists targetType/targetId and scopes getEntriesForRecord', () => {
    const add = useAuditLogStore.getState().addEntry;
    add({ action: 'control_updated', entity: 'CTL-1', field: 'status', oldValue: 'a', newValue: 'b', ...target });
    add({ action: 'control_updated', entity: 'CTL-2', field: 'status', oldValue: 'a', newValue: 'b', targetType: 'control', targetId: 'CTL-2' });
    expect(useAuditLogStore.getState().getEntriesForRecord('control', 'CTL-1')).toHaveLength(1);
    expect(useAuditLogStore.getState().getEntriesForRecord('control', 'CTL-2')).toHaveLength(1);
  });

  test('legacy entries without target fields still return from getEntries', () => {
    useAuditLogStore.setState({
      entries: [{ id: 'x', timestamp: new Date().toISOString(), action: 'score_changed', entity: 'legacy', field: 'score', oldValue: '1', newValue: '2', user: 'System' }]
    });
    expect(useAuditLogStore.getState().getEntries()).toHaveLength(1);
    expect(useAuditLogStore.getState().getEntriesForRecord('control', 'CTL-1')).toHaveLength(0);
  });

  test('attributes to the acting user resolved at write time (production path)', () => {
    useUserStore.getState().setCurrentUser(7);
    useAuditLogStore.getState().addEntry({ action: 'control_updated', entity: 'e', field: 'f', oldValue: 'a', newValue: 'b', ...target });
    expect(useAuditLogStore.getState().entries[0].user).toBe('Nadia.Khan');
    expect(getActorName()).toBe('Nadia.Khan');
  });

  test('falls back to System when the acting user id no longer resolves', () => {
    useUserStore.getState().setCurrentUser(7);
    useUserStore.getState().deleteUser(7);
    useAuditLogStore.getState().addEntry({ action: 'control_updated', entity: 'e', field: 'f', oldValue: 'a', newValue: 'b', ...target });
    expect(useAuditLogStore.getState().entries[0].user).toBe('System');
  });

  test('truncates stored values to 120 chars with an ellipsis marker', () => {
    useAuditLogStore.getState().addEntry({ action: 'control_updated', entity: 'e', field: 'f', oldValue: 'x'.repeat(300), newValue: 'y'.repeat(300), ...target });
    const e = useAuditLogStore.getState().entries[0];
    expect(e.oldValue.length).toBe(120);
    expect(e.oldValue.endsWith('…')).toBe(true);
    expect(e.newValue.length).toBe(120);
  });
});

describe('keystroke coalescing', () => {
  test('same actor+record+field within the window updates the entry in place', () => {
    const add = useAuditLogStore.getState().addEntry;
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'A', newValue: 'Ab', ...target });
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'Ab', newValue: 'Abc', ...target });
    const entries = useAuditLogStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0].oldValue).toBe('A');
    expect(entries[0].newValue).toBe('Abc');
  });

  test('typing back to the original value drops the entry entirely', () => {
    const add = useAuditLogStore.getState().addEntry;
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'A', newValue: 'Ab', ...target });
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'Ab', newValue: 'A', ...target });
    expect(useAuditLogStore.getState().entries).toHaveLength(0);
  });

  test('a different field or record never coalesces', () => {
    const add = useAuditLogStore.getState().addEntry;
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'A', newValue: 'B', ...target });
    add({ action: 'control_updated', entity: 'e', field: 'status', oldValue: 'x', newValue: 'y', ...target });
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'A', newValue: 'B', targetType: 'control', targetId: 'CTL-9' });
    expect(useAuditLogStore.getState().entries).toHaveLength(3);
  });

  test('entries older than the window are never coalesced', () => {
    const add = useAuditLogStore.getState().addEntry;
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'A', newValue: 'B', ...target });
    const aged = useAuditLogStore.getState().entries.map(e => ({
      ...e,
      timestamp: new Date(Date.now() - COALESCE_WINDOW_MS - 1000).toISOString()
    }));
    useAuditLogStore.setState({ entries: aged });
    add({ action: 'control_updated', entity: 'e', field: 'name', oldValue: 'B', newValue: 'C', ...target });
    expect(useAuditLogStore.getState().entries).toHaveLength(2);
  });
});

describe('logFieldChanges', () => {
  test('one entry per changed field; untouched and absent fields never log', () => {
    const n = useAuditLogStore.getState().logFieldChanges({
      ...target,
      entity: 'CTL-1',
      before: { name: 'old', status: 'Implemented', tests: 'same' },
      after: { name: 'new', status: 'Not Implemented', tests: 'same' },
      defaultAction: 'control_updated',
      fields: ['name', 'status', 'tests', 'frameworks']
    });
    expect(n).toBe(2);
    const fields = useAuditLogStore.getState().entries.map(e => e.field).sort();
    expect(fields).toEqual(['name', 'status']);
  });

  test('a no-op update writes zero entries', () => {
    const n = useAuditLogStore.getState().logFieldChanges({
      ...target,
      entity: 'CTL-1',
      before: { name: 'same' },
      after: { name: 'same' },
      defaultAction: 'control_updated',
      fields: ['name']
    });
    expect(n).toBe(0);
    expect(useAuditLogStore.getState().entries).toHaveLength(0);
  });

  test('diffs FULL values even past the truncation cap', () => {
    const base = 'z'.repeat(150);
    const n = useAuditLogStore.getState().logFieldChanges({
      ...target,
      entity: 'CTL-1',
      before: { tests: `${base}old` },
      after: { tests: `${base}new` },
      defaultAction: 'control_updated',
      fields: ['tests']
    });
    expect(n).toBe(1);
  });

  test('per-field action override and nested getter work', () => {
    useAuditLogStore.getState().logFieldChanges({
      targetType: 'evaluation',
      targetId: 'ASM-1::PR.DS-01',
      entity: 'A / PR.DS-01',
      before: { score: 3, remediation: { actionPlan: 'a' } },
      after: { score: 5, remediation: { actionPlan: 'b' } },
      defaultAction: 'observation_updated',
      fields: [
        { key: 'score', action: 'score_changed' },
        { key: 'remediation', label: 'remediation.actionPlan', get: (o) => o?.remediation?.actionPlan }
      ]
    });
    const entries = useAuditLogStore.getState().entries;
    expect(entries.map(e => e.action).sort()).toEqual(['observation_updated', 'score_changed']);
    expect(entries.find(e => e.action === 'observation_updated').field).toBe('remediation.actionPlan');
  });
});

describe('CSV export formula guard', () => {
  test('values starting with = + - @ are neutralized in the CSV', () => {
    const add = useAuditLogStore.getState().addEntry;
    add({ action: 'comment_added', entity: '@Steve.T mention', field: 'f', oldValue: '=cmd|calc', newValue: '@Steve.T hi', ...target });
    let csvText = null;
    const OriginalBlob = global.Blob;
    global.Blob = class { constructor(parts) { csvText = parts.join(''); } };
    global.URL.createObjectURL = jest.fn(() => 'blob:x');
    global.URL.revokeObjectURL = jest.fn();
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    try {
      useAuditLogStore.getState().exportCSV();
    } finally {
      global.Blob = OriginalBlob;
      click.mockRestore();
    }
    expect(csvText).toContain(`"'=cmd|calc"`);
    expect(csvText).toContain(`"'@Steve.T hi"`);
    expect(csvText).toContain(`"'@Steve.T mention"`);
  });
});
