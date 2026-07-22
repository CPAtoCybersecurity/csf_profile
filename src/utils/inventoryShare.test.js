/**
 * Inventory data-flow proofs: complete backup carries systems (format 6),
 * the DEFAULT share export carries none of it (section OMIT + zeroed count —
 * a populated inventory is a target list), include-private carries the folded
 * records, undeclared fields die on the production fold, and restore heals
 * junk/duplicate records through the unconditional normalize pass.
 */
import { exportAllDataJSON, buildShareableExport, EXPORT_FORMAT_VERSION } from './dataExport';
import { validateDatabaseExport, importCompleteDatabase } from './dataImport';
import useAssessmentsStore from '../stores/assessmentsStore';
import useControlsStore from '../stores/controlsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useFrameworksStore from '../stores/frameworksStore';
import useArtifactStore from '../stores/artifactStore';
import useUserStore from '../stores/userStore';
import useFindingsStore from '../stores/findingsStore';
import useMetricsStore from '../stores/metricsStore';
import useOrgProfileStore from '../stores/orgProfileStore';
import useInventoryStore from '../stores/inventoryStore';

const stores = () => ({
  controlsStore: useControlsStore,
  assessmentsStore: useAssessmentsStore,
  requirementsStore: useRequirementsStore,
  frameworksStore: useFrameworksStore,
  artifactStore: useArtifactStore,
  userStore: useUserStore,
  findingsStore: useFindingsStore,
  metricsStore: useMetricsStore,
  orgProfileStore: useOrgProfileStore,
  inventoryStore: useInventoryStore
});

// Canary strings: a system identity, an internal admin URL, an external
// person's identity, and a weak-posture answer must NEVER ride a default
// share. Distinctive enough that a stringify probe is unambiguous.
const CANARY_NAME = 'InventoryCanaryPayroll';
const CANARY_URL = 'https://vault-admin.internal.canary.example/console';
const CANARY_VENDOR_CONTACT = 'Sam Vendorperson sam@canaryvendor.example';

const seedCanarySystem = () =>
  useInventoryStore.getState().addSystem({
    name: CANARY_NAME,
    applicationUrl: CANARY_URL,
    vendorContact: CANARY_VENDOR_CONTACT,
    dataClassification: 'Strictly Confidential',
    ssoMfa: 'No',
    localAccounts: 'Yes',
    secretsInVault: 'No',
    internetExposure: 'Public internet',
    evidenceLinks: [{ label: 'Ticket', url: 'https://tickets.internal.canary.example/T-1' }]
  });

beforeEach(() => {
  window.localStorage.clear();
  useInventoryStore.setState({ systems: [] });
});

describe('complete backup (format 6)', () => {
  test('carries the systems section, count, and schema version slot', () => {
    seedCanarySystem();
    const envelope = exportAllDataJSON(stores());
    expect(EXPORT_FORMAT_VERSION).toBe(6);
    expect(envelope.formatVersion).toBe(6);
    expect(envelope.data.systems).toHaveLength(1);
    expect(envelope.data.systems[0].name).toBe(CANARY_NAME);
    expect(envelope.metadata.systemCount).toBe(1);
    expect(Object.prototype.hasOwnProperty.call(envelope.storeVersions, 'systems')).toBe(true);
  });
});

describe('share export — default mode', () => {
  test('systems section is DELETED (not emptied) and the count zeroes with it', () => {
    seedCanarySystem();
    const share = buildShareableExport(stores());
    expect(share.data.systems).toBeUndefined();
    expect(Object.prototype.hasOwnProperty.call(share.data, 'systems')).toBe(false);
    expect(share.metadata.systemCount).toBe(0);
  });

  test('leak polarity: no inventory canary string survives anywhere in the envelope', () => {
    seedCanarySystem();
    const serialized = JSON.stringify(buildShareableExport(stores()));
    expect(serialized).not.toContain(CANARY_NAME);
    expect(serialized).not.toContain('canary.example');
    expect(serialized).not.toContain('Vendorperson');
  });
});

describe('share export — include-private mode', () => {
  test('systems ride folded, with count recomputed from the folded section', () => {
    seedCanarySystem();
    const share = buildShareableExport(stores(), { includePrivate: true });
    expect(share.data.systems).toHaveLength(1);
    expect(share.data.systems[0].name).toBe(CANARY_NAME);
    expect(share.data.systems[0].applicationUrl).toBe(CANARY_URL);
    expect(share.metadata.systemCount).toBe(1);
  });

  test('an undeclared field dies on the PRODUCTION fold even under include-private', () => {
    seedCanarySystem();
    // setSystems is the open-shape producer (restore lane) — inject a field
    // the registry has never heard of.
    const [system] = useInventoryStore.getState().systems;
    useInventoryStore.getState().setSystems([{ ...system, zzUndeclaredSecret: 'should-die' }]);
    const share = buildShareableExport(stores(), { includePrivate: true });
    expect(share.data.systems[0].zzUndeclaredSecret).toBeUndefined();
    expect(JSON.stringify(share)).not.toContain('should-die');
  });
});

describe('restore', () => {
  test('format-6 round-trip restores systems through the bulk setter', () => {
    seedCanarySystem();
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores())));
    useInventoryStore.setState({ systems: [] });

    const result = importCompleteDatabase(parsed, stores(), { backupFirst: false });
    expect(result.applied).toContain('systems');
    const restored = useInventoryStore.getState().systems;
    expect(restored).toHaveLength(1);
    expect(restored[0].name).toBe(CANARY_NAME);
    expect(restored[0].id).toBe('SYS-001');

    // Post-restore id continuity: there is no stored counter — the next id is
    // recomputed from the restored records, so a restore can never set up a
    // future SYS-NNN collision.
    const added = useInventoryStore.getState().addSystem({ name: 'Post-restore add' });
    expect(added.id).toBe('SYS-002');
    const ids = useInventoryStore.getState().systems.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('a pre-inventory (format ≤5) file leaves the local inventory untouched', () => {
    seedCanarySystem();
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores())));
    parsed.formatVersion = 5;
    delete parsed.data.systems;
    delete parsed.storeVersions.systems;

    const validation = validateDatabaseExport(parsed);
    expect(validation.ok).toBe(true);
    const result = importCompleteDatabase(parsed, stores(), { backupFirst: false });
    expect(result.skipped).toContain('systems');
    expect(useInventoryStore.getState().systems).toHaveLength(1); // still here
  });

  test('unconditional heal: junk and duplicate-id records normalize on the way in', () => {
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores())));
    parsed.data.systems = [
      'junk-entry',
      { name: 'No id' },
      { id: 'SYS-001', name: 'First' },
      { id: 'SYS-001', name: 'Duplicate' }
    ];

    importCompleteDatabase(parsed, stores(), { backupFirst: false });
    const restored = useInventoryStore.getState().systems;
    expect(restored).toHaveLength(3); // junk dropped
    const ids = restored.map((s) => s.id);
    expect(new Set(ids).size).toBe(3); // duplicates re-stamped
    restored.forEach((s) => expect(s.id).toMatch(/^SYS-\d+$/));
    // Blank posture stays blank through the heal — never coerced to "No".
    expect(restored.find((s) => s.name === 'No id').ssoMfa).toBe('');
  });

  test('a newer-format file is rejected before any store write', () => {
    seedCanarySystem();
    const parsed = JSON.parse(JSON.stringify(exportAllDataJSON(stores())));
    parsed.formatVersion = EXPORT_FORMAT_VERSION + 1;
    const validation = validateDatabaseExport(parsed);
    expect(validation.ok).toBe(false);
    expect(validation.errors.join(' ')).toContain('newer version');
  });
});
