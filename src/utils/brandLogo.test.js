/**
 * Custom brand logo — validation, sizing, and store/export/restore wiring.
 *
 * The load-bearing claims under test:
 *  - the data-URL guard matches POSITIVELY (allow-list), so an unrecognised
 *    scheme or an SVG payload can never reach an `<img src>`;
 *  - a logo does NOT make the app think an org profile exists, and never
 *    reaches an AI prompt;
 *  - a backup round-trips the logo, a share export never carries it, and a
 *    legacy backup without the field leaves the receiver's logo alone.
 */
import {
  isSafeLogoDataUrl,
  validateLogoFile,
  prepareLogoFromFile,
  downscaleDataUrl,
  LOGO_ACCEPTED_MIME,
  LOGO_ACCEPT_ATTR,
  LOGO_MAX_SOURCE_BYTES,
  LOGO_MAX_PERSISTED_CHARS
} from './brandLogo';
import { exportAllDataJSON, buildShareableExport } from './dataExport';
import { importCompleteDatabase } from './dataImport';
import { buildTailorPrompt } from './procedureTailor';
import useOrgProfileStore, { EMPTY_BRANDING } from '../stores/orgProfileStore';
import useFrameworksStore from '../stores/frameworksStore';
import useControlsStore from '../stores/controlsStore';
import useAssessmentsStore from '../stores/assessmentsStore';
import useRequirementsStore from '../stores/requirementsStore';
import useArtifactStore from '../stores/artifactStore';
import useUserStore from '../stores/userStore';
import useFindingsStore from '../stores/findingsStore';
import useMetricsStore from '../stores/metricsStore';
import useInventoryStore from '../stores/inventoryStore';
import useCommentsStore from '../stores/commentsStore';

// 1x1 transparent PNG — a real, decodable payload.
const PNG_1X1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Built by concatenation so eslint's no-script-url rule stays quiet about a
// string that exists precisely to be REFUSED.
const SCRIPT_URL = `${'java'}${'script'}:alert(1)`;

// The full store map the app itself passes (Settings.buildExportStores).
// Restore refuses to run against a partial map — it checks every section's
// setter up front so it can never leave a half-restored database — so the
// round-trip tests below must drive the real thing.
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
  inventoryStore: useInventoryStore,
  commentsStore: useCommentsStore
});

const restore = (backup) => importCompleteDatabase(backup, stores(), { backupFirst: false });

const fileOf = (type, size, name = 'logo.png') => ({ type, size, name });

beforeEach(() => {
  useOrgProfileStore.setState({ profile: null, cloudConsent: false, branding: { ...EMPTY_BRANDING } });
});

describe('isSafeLogoDataUrl — positive match, fail closed', () => {
  test('accepts each allow-listed raster type', () => {
    LOGO_ACCEPTED_MIME.forEach((mime) => {
      expect(isSafeLogoDataUrl(`data:${mime};base64,iVBORw0KGgo=`)).toBe(true);
    });
  });

  test.each([
    ['javascript scheme', SCRIPT_URL],
    ['html data url', 'data:text/html;base64,PHNjcmlwdD4='],
    ['svg data url', 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4='],
    ['svg utf8 data url', 'data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>'],
    ['remote url', 'https://evil.example/logo.png'],
    ['relative path', '/SC_Logo.png'],
    ['non-base64 payload', 'data:image/png,rawbytes'],
    ['empty string', ''],
    ['not a string', 12345]
  ])('refuses %s', (_label, value) => {
    expect(isSafeLogoDataUrl(value)).toBe(false);
  });
});

describe('validateLogoFile', () => {
  test('the file input accept attribute names exactly the allow-listed types', () => {
    // Picker and guard cannot drift: both derive from LOGO_ACCEPTED_MIME.
    expect(LOGO_ACCEPT_ATTR.split(',')).toEqual(LOGO_ACCEPTED_MIME);
    expect(LOGO_ACCEPT_ATTR).not.toContain('svg');
  });

  test('refuses an unsupported type, naming it', () => {
    const result = validateLogoFile(fileOf('image/svg+xml', 1000, 'logo.svg'));
    expect(result.ok).toBe(false);
    expect(result.error).toContain('image/svg+xml');
  });

  test('refuses an oversize file with a message naming the limit', () => {
    const result = validateLogoFile(fileOf('image/png', LOGO_MAX_SOURCE_BYTES + 1));
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/2 MB/);
  });

  test('accepts a supported file inside the cap', () => {
    expect(validateLogoFile(fileOf('image/png', 50 * 1024)).ok).toBe(true);
  });
});

describe('downscaleDataUrl', () => {
  test('resolves to the input when no canvas is available (jsdom has no 2d context)', async () => {
    // The size invariant is still enforced downstream by the persist cap —
    // this branch must degrade, not throw.
    await expect(downscaleDataUrl(PNG_1X1)).resolves.toEqual(expect.any(String));
  });
});

describe('prepareLogoFromFile', () => {
  const fileFrom = (dataUrl, { type = 'image/png', name = 'logo.png' } = {}) => {
    const base64 = dataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return new File([bytes], name, { type });
  };

  test('produces a storable data URL for a real PNG', async () => {
    const result = await prepareLogoFromFile(fileFrom(PNG_1X1));
    expect(result.ok).toBe(true);
    expect(isSafeLogoDataUrl(result.dataUrl)).toBe(true);
    expect(result.dataUrl.length).toBeLessThanOrEqual(LOGO_MAX_PERSISTED_CHARS);
    expect(result.fileName).toBe('logo.png');
  });

  test('refuses before reading when the type is not allow-listed', async () => {
    const result = await prepareLogoFromFile(fileFrom(PNG_1X1, { type: 'image/svg+xml', name: 'x.svg' }));
    expect(result.ok).toBe(false);
    expect(result.dataUrl).toBeUndefined();
  });
});

describe('orgProfileStore branding slice', () => {
  test('setBrandLogo stores a valid logo and reports success', () => {
    expect(useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png')).toBe(true);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe(PNG_1X1);
    expect(useOrgProfileStore.getState().branding.logoFileName).toBe('acme.png');
    expect(useOrgProfileStore.getState().hasBrandLogo()).toBe(true);
  });

  test('the store itself refuses a hostile value — the UI is not the only gate', () => {
    expect(useOrgProfileStore.getState().setBrandLogo(SCRIPT_URL)).toBe(false);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe('');
  });

  test('the store itself refuses an over-cap value', () => {
    const huge = `data:image/png;base64,${'A'.repeat(LOGO_MAX_PERSISTED_CHARS)}`;
    expect(useOrgProfileStore.getState().setBrandLogo(huge)).toBe(false);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe('');
  });

  test('clearBrandLogo returns to the default shield', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    useOrgProfileStore.getState().clearBrandLogo();
    expect(useOrgProfileStore.getState().hasBrandLogo()).toBe(false);
  });

  test('a logo does NOT make hasProfile() true — branding is not an org profile', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    expect(useOrgProfileStore.getState().hasProfile()).toBe(false);
  });

  test('the logo never reaches an AI prompt', () => {
    useOrgProfileStore.getState().saveProfile({ orgName: 'Acme' });
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    // buildTailorPrompt is the real cloud-AI egress surface; it folds in the
    // profile block. The branding slice is not part of `profile`, so it has no
    // path into the prompt.
    const prompt = buildTailorPrompt('# Procedure', useOrgProfileStore.getState().profile);
    expect(prompt).toContain('Acme');
    expect(prompt).not.toContain('data:image');
    expect(prompt).not.toContain('base64');
  });
});

describe('backup, share, and restore', () => {
  test('a complete backup carries the logo', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    const backup = exportAllDataJSON(stores());
    expect(backup.data.orgProfile.branding.logoDataUrl).toBe(PNG_1X1);
  });

  test('no share export carries the logo — in EITHER mode', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    [{ includePrivate: false }, { includePrivate: true }].forEach((mode) => {
      const share = buildShareableExport(stores(), mode);
      expect(share.data.orgProfile).toBeUndefined();
      const serialized = JSON.stringify(share);
      expect(serialized).not.toContain('data:image/png');
      expect(serialized).not.toContain('acme.png'); // filename is org-identifying too
    });
  });

  test('restore round-trips the logo', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    const backup = exportAllDataJSON(stores());
    useOrgProfileStore.getState().clearBrandLogo();

    restore(backup);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe(PNG_1X1);
  });

  test('a legacy backup with no branding key leaves the receiver logo untouched', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    const backup = exportAllDataJSON(stores());
    delete backup.data.orgProfile.branding; // format 4-7 shape

    restore(backup);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe(PNG_1X1);
  });

  test('a hand-edited backup carrying a hostile logo is rejected at restore', () => {
    const backup = exportAllDataJSON(stores());
    backup.data.orgProfile.branding = {
      logoDataUrl: 'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9ImFsZXJ0KDEpIj48L3N2Zz4=',
      logoFileName: 'evil.svg'
    };

    restore(backup);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe('');
  });
});

/**
 * Gaps surfaced by the pre-completion advisor round, each turned into a probe
 * rather than an argument.
 */
describe('advisor round — hydration, bleed-through, and rollback', () => {
  const STORAGE_KEY = 'csf-org-profile-storage';

  const hydrateFrom = (persistedState) => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: persistedState, version: 1 })
    );
    useOrgProfileStore.persist.rehydrate();
  };

  afterEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  test('a poisoned localStorage value never lands in state — the guard runs at hydration', () => {
    hydrateFrom({
      profile: null,
      cloudConsent: false,
      branding: { logoDataUrl: 'data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>', logoFileName: 'evil.svg' }
    });

    // Not merely unrendered: absent from state, so it cannot be re-persisted
    // on the next write or exported into a complete backup.
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe('');
    expect(exportAllDataJSON(stores()).data.orgProfile.branding.logoDataUrl).toBe('');
  });

  test('a value persisted before the quota-safe storage switch still hydrates', () => {
    // Same key, same envelope shape — quotaSafeLocalStorage only wraps setItem
    // in a try/catch, so a pre-switch value must survive unchanged.
    hydrateFrom({ profile: { orgName: 'Legacy Co' }, cloudConsent: true, branding: { logoDataUrl: PNG_1X1, logoFileName: 'legacy.png' } });

    expect(useOrgProfileStore.getState().profile.orgName).toBe('Legacy Co');
    expect(useOrgProfileStore.getState().cloudConsent).toBe(true);
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe(PNG_1X1);
  });

  test('a pre-branding persisted value hydrates to the default shield, not undefined', () => {
    hydrateFrom({ profile: { orgName: 'Pre-branding Co' }, cloudConsent: false });

    expect(useOrgProfileStore.getState().branding).toEqual({ logoDataUrl: '', logoFileName: '' });
    expect(useOrgProfileStore.getState().hasBrandLogo()).toBe(false);
  });

  test('current-format exports ALWAYS emit the branding key, even with no logo', () => {
    // This is what keeps "absent" unambiguous: absent means legacy file, never
    // "current file that happened to have no logo".
    expect(exportAllDataJSON(stores()).data.orgProfile).toHaveProperty('branding');
  });

  test('restoring a current backup taken with no logo CLEARS a pre-existing one', () => {
    const backupWithNoLogo = exportAllDataJSON(stores());
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');

    restore(backupWithNoLogo);

    // The cross-org bleed case: importing someone else's backup must not leave
    // your logo standing on their data.
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe('');
  });

  test('a failed restore rolls a newly-set logo back OFF, not just back to a previous one', () => {
    // The direction that absent-means-untouched semantics could break: no logo
    // before, restore sets one, restore then fails.
    const backup = exportAllDataJSON(stores());
    backup.data.orgProfile.branding = { logoDataUrl: PNG_1X1, logoFileName: 'acme.png' };
    const broken = { ...stores(), commentsStore: { getState: () => ({ setComments: undefined }) } };

    expect(() => importCompleteDatabase(backup, broken, { backupFirst: false })).toThrow();
    expect(useOrgProfileStore.getState().branding.logoDataUrl).toBe('');
  });
});
