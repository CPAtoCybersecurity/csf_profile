import useInventoryStore, {
  INVENTORY_FIELD_CLASSES,
  MAX_EVIDENCE_LINKS,
  SYSTEM_FIELD_DEFAULTS,
  nextSystemId,
  normalizeEvidenceLinks,
  normalizeSystemFields,
  normalizeSystemRecord
} from './inventoryStore';

beforeEach(() => {
  window.localStorage.clear();
  useInventoryStore.setState({ systems: [] });
});

describe('inventoryStore', () => {
  test('seeds EMPTY — no demo/default records (standing new-entity rule)', () => {
    expect(useInventoryStore.getState().systems).toEqual([]);
  });

  test('addSystem stamps id, source, createdDate, lastModified', () => {
    const created = useInventoryStore.getState().addSystem({ name: 'HRIS' });
    expect(created.id).toBe('SYS-001');
    expect(created.source).toBe('manual');
    expect(created.createdDate).toBeTruthy();
    expect(created.lastModified).toBeTruthy();
    expect(useInventoryStore.getState().systems).toHaveLength(1);
  });

  test('caller-supplied id / source / createdDate never survive addSystem', () => {
    const created = useInventoryStore.getState().addSystem({
      name: 'Sneaky',
      id: 'SYS-999',
      source: 'pack',
      createdDate: '1999-01-01'
    });
    expect(created.id).toBe('SYS-001');
    expect(created.source).toBe('manual');
    expect(created.createdDate).not.toBe('1999-01-01');
  });

  test('ids are max-plus-one and never recycled after a delete', () => {
    const store = useInventoryStore.getState();
    store.addSystem({ name: 'A' }); // SYS-001
    store.addSystem({ name: 'B' }); // SYS-002
    useInventoryStore.getState().deleteSystem('SYS-001');
    const third = useInventoryStore.getState().addSystem({ name: 'C' });
    expect(third.id).toBe('SYS-003'); // SYS-001 stays retired with its history
  });

  test('untouched tri-state posture answers stay blank — unset is not "No"', () => {
    const created = useInventoryStore.getState().addSystem({ name: 'Blank posture' });
    expect(created.pii).toBe('');
    expect(created.ssoMfa).toBe('');
    expect(created.secretsInVault).toBe('');
    expect(created.backupsInPlace).toBe('');
  });

  test('updateSystem merges fields, stamps lastModified, pins id/source/createdDate', () => {
    const created = useInventoryStore.getState().addSystem({ name: 'Before' });
    useInventoryStore.getState().updateSystem('SYS-001', {
      name: 'After',
      id: 'SYS-777',
      source: 'pack',
      createdDate: '1999-01-01',
      ssoMfa: 'Yes'
    });
    const updated = useInventoryStore.getState().getSystem('SYS-001');
    expect(updated.name).toBe('After');
    expect(updated.ssoMfa).toBe('Yes');
    expect(updated.id).toBe('SYS-001');
    expect(updated.source).toBe('manual');
    expect(updated.createdDate).toBe(created.createdDate);
  });

  test('setSystems full-replaces (restore path) and rejects non-arrays', () => {
    useInventoryStore.getState().addSystem({ name: 'Old' });
    useInventoryStore.getState().setSystems([{ ...SYSTEM_FIELD_DEFAULTS, id: 'SYS-009', name: 'Restored' }]);
    expect(useInventoryStore.getState().systems).toHaveLength(1);
    expect(useInventoryStore.getState().systems[0].name).toBe('Restored');
    useInventoryStore.getState().setSystems('junk');
    expect(useInventoryStore.getState().systems).toEqual([]);
  });
});

describe('normalizeSystemRecord (shape, not vocabulary)', () => {
  test('wrong-typed values collapse to unset; unknown picklist strings survive', () => {
    const out = normalizeSystemRecord({
      name: 'Mixed',
      pii: 5, // junk type → unset
      stage: 'Custom stage', // unknown vocabulary → preserved
      regulatedDataTypes: ['PHI', 7, null], // non-strings filtered
      adminCount: '4', // numeric string → number
      rtoHours: 'lots', // junk numeric → unset
      notes: ['not', 'a', 'string'] // junk type → unset
    });
    expect(out.pii).toBe('');
    expect(out.stage).toBe('Custom stage');
    expect(out.regulatedDataTypes).toEqual(['PHI']);
    expect(out.adminCount).toBe(4);
    expect(out.rtoHours).toBe('');
    expect(out.notes).toBe('');
  });

  test('junk records return null; absent fields get their unset default', () => {
    expect(normalizeSystemRecord('string')).toBeNull();
    expect(normalizeSystemRecord(null)).toBeNull();
    expect(normalizeSystemRecord([])).toBeNull();
    const out = normalizeSystemRecord({ name: 'Sparse' });
    Object.keys(SYSTEM_FIELD_DEFAULTS).forEach((field) => {
      expect(out[field]).toBeDefined();
    });
    expect(out.evidenceLinks).toEqual([]);
  });
});

describe('normalizeEvidenceLinks', () => {
  test('junk collapses, missing ids stamp, cap enforced', () => {
    expect(normalizeEvidenceLinks('junk')).toEqual([]);
    const many = Array.from({ length: MAX_EVIDENCE_LINKS + 5 }, (_, i) => ({
      label: `L${i}`,
      url: `https://example.test/${i}`
    }));
    const out = normalizeEvidenceLinks([...many, 'junk-item', null]);
    expect(out).toHaveLength(MAX_EVIDENCE_LINKS);
    out.forEach((link) => {
      expect(typeof link.id).toBe('string');
      expect(link.id).not.toBe('');
    });
  });
});

describe('normalizeSystemFields (restore heal)', () => {
  test('drops junk records, stamps missing ids, re-stamps duplicates, idempotent', () => {
    const healed = normalizeSystemFields({
      systems: [
        'junk',
        { name: 'No id yet' },
        { id: 'SYS-004', name: 'Valid' },
        { id: 'SYS-004', name: 'Duplicate id' },
        { id: 'not-a-sys-id', name: 'Malformed id' }
      ]
    });
    const ids = healed.systems.map((s) => s.id);
    expect(healed.systems).toHaveLength(4);
    expect(new Set(ids).size).toBe(4); // all unique
    expect(ids).toContain('SYS-004'); // first valid claim wins
    ids.forEach((id) => expect(id).toMatch(/^SYS-\d+$/));

    const again = normalizeSystemFields({ systems: healed.systems });
    expect(again.systems).toEqual(healed.systems); // idempotent
  });

  test('nextSystemId is max-plus-one over well-formed ids only', () => {
    expect(nextSystemId([])).toBe('SYS-001');
    expect(nextSystemId([{ id: 'SYS-002' }, { id: 'garbage' }, { id: 'SYS-010' }])).toBe('SYS-011');
  });
});

describe('INVENTORY_FIELD_CLASSES (export-lane sensitivity map)', () => {
  test('every record field is classified exactly once — fail-closed completeness', () => {
    const allFields = [
      ...Object.keys(SYSTEM_FIELD_DEFAULTS),
      'id',
      'source',
      'createdDate',
      'lastModified'
    ].sort();
    const classified = [...INVENTORY_FIELD_CLASSES.open, ...INVENTORY_FIELD_CLASSES.sensitive].sort();
    expect(classified).toEqual(allFields);
    const overlap = INVENTORY_FIELD_CLASSES.open.filter((f) =>
      INVENTORY_FIELD_CLASSES.sensitive.includes(f)
    );
    expect(overlap).toEqual([]);
  });

  test('the attack-surface fields sit in the sensitive class', () => {
    ['applicationUrl', 'ssoMfa', 'localAccounts', 'secretsInVault', 'internetExposure', 'vendorContact']
      .forEach((field) => expect(INVENTORY_FIELD_CLASSES.sensitive).toContain(field));
  });
});
