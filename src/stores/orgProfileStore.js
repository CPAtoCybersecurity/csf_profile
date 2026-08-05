import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { quotaSafeLocalStorage } from '../utils/safeStorage';
import { isSafeLogoDataUrl, LOGO_MAX_PERSISTED_CHARS } from '../utils/brandLogo';

/**
 * Organization profile — powers optional tailoring of community test
 * procedures (org-name substitution, AI tailoring context).
 *
 * PRIVACY MODEL (see PRIVATE_DATA.md): this is the most sensitive record in
 * the app — crown jewels plus the security tooling list read like an
 * attacker's shopping list. It lives only in this browser's localStorage,
 * is UNCONDITIONALLY excluded from share exports (including derived text:
 * tailored procedures are swapped back to the pristine community version),
 * and rides complete backups only. Sending profile text to a CLOUD AI
 * provider requires the explicit cloudConsent opt-in; local Ollama needs
 * none.
 */

export const ORG_PROFILE_SCHEMA_VERSION = 1;

/**
 * Branding lives BESIDE `profile`, never inside it. Three things depend on
 * that placement:
 *  - `profileHasContent` (and therefore `hasProfile()`, which gates the
 *    tailoring UI) must not flip to true just because someone uploaded a
 *    logo — a logo is not an org profile;
 *  - `profileToPromptContext` (procedureTailor.js) enumerates profile fields
 *    positively, so a base64 image can never be swept into an AI prompt;
 *  - the export/share plumbing already treats the whole `orgProfile` section
 *    as backup-only (shareRegistry: `orgProfile: { disposition: OMIT }`), so
 *    the logo inherits "rides complete backups, never rides a share" without
 *    a registry edit or an EXPORT_FORMAT_VERSION bump.
 */
export const EMPTY_BRANDING = {
  logoDataUrl: '',
  logoFileName: ''
};

export const EMPTY_PROFILE = {
  orgName: '',
  industry: '',
  sizeBand: '',
  infrastructure: [],
  securityTools: [],
  crownJewels: [],
  notes: ''
};

const profileHasContent = (profile) => {
  if (!profile) return false;
  return Object.values(profile).some((v) =>
    Array.isArray(v) ? v.length > 0 : String(v || '').trim() !== ''
  );
};

/**
 * Coerce an untrusted branding blob (a restored backup file, a hand-edited
 * localStorage value) into the stored shape. Fail-CLOSED and positive-match:
 * anything that is not a recognised raster data URL under the persist cap
 * resolves to no logo, so the shield renders rather than an attacker-chosen
 * `src`. Returns null when the input carries no branding key at all, which
 * the callers read as "leave what is already here alone".
 */
const normalizeBranding = (value) => {
  if (!value || typeof value !== 'object') return null;
  const url = typeof value.logoDataUrl === 'string' ? value.logoDataUrl : '';
  const safe = isSafeLogoDataUrl(url) && url.length <= LOGO_MAX_PERSISTED_CHARS;
  return {
    logoDataUrl: safe ? url : '',
    logoFileName: safe && typeof value.logoFileName === 'string' ? value.logoFileName.slice(0, 120) : ''
  };
};

const useOrgProfileStore = create(
  persist(
    (set, get) => ({
      profile: null, // null = never set up
      cloudConsent: false,
      branding: { ...EMPTY_BRANDING },

      saveProfile: (partial) =>
        set({ profile: { ...EMPTY_PROFILE, ...(get().profile || {}), ...partial } }),

      setCloudConsent: (value) => set({ cloudConsent: !!value }),

      clearProfile: () => set({ profile: null, cloudConsent: false }),

      hasProfile: () => profileHasContent(get().profile),

      /**
       * Apply a custom brand logo. The guard runs HERE as well as in the UI:
       * the store is the last gate before the value is persisted and handed
       * to an `<img src>`, and the restore path reaches it without touching
       * the upload form at all. Returns false (state untouched) on refusal so
       * the caller can surface a message instead of failing silently.
       */
      setBrandLogo: (logoDataUrl, logoFileName = '') => {
        if (!isSafeLogoDataUrl(logoDataUrl)) return false;
        if (logoDataUrl.length > LOGO_MAX_PERSISTED_CHARS) return false;
        set({ branding: { logoDataUrl, logoFileName: String(logoFileName || '').slice(0, 120) } });
        return true;
      },

      clearBrandLogo: () => set({ branding: { ...EMPTY_BRANDING } }),

      hasBrandLogo: () => isSafeLogoDataUrl(get().branding?.logoDataUrl),

      // Bulk setter for the backup-restore path (dataImport.js). Branding is
      // ABSENT-MEANS-UNTOUCHED: format 4-7 backups predate the field, and an
      // older file must not wipe the receiving install's logo (the same
      // deleted-not-emptied reasoning the share registry uses for sections).
      setProfileState: (state) => {
        const branding = normalizeBranding(state && state.branding);
        set({
          profile: state && profileHasContent(state.profile) ? { ...EMPTY_PROFILE, ...state.profile } : null,
          cloudConsent: !!(state && state.cloudConsent),
          ...(branding ? { branding } : {})
        });
      }
    }),
    {
      name: 'csf-org-profile-storage',
      version: ORG_PROFILE_SCHEMA_VERSION,
      // A logo is by far the largest value this store will ever hold. Plain
      // localStorage lets zustand persist swallow a quota failure in silence;
      // the quota-safe wrapper (already used by assessmentsStore) tells the
      // user their changes are not being saved. Read/serialize semantics are
      // otherwise identical to the default storage, so values persisted before
      // this switch hydrate unchanged.
      storage: createJSONStorage(() => quotaSafeLocalStorage),
      // Hydration is the FOURTH guard point, and the one that matters most:
      // localStorage is directly editable, and a poisoned value that only got
      // caught at render would still sit in state, get re-persisted on the next
      // unrelated write, and ride the user's next complete backup. Normalizing
      // here means it never lands in state at all.
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted || {}) };
        return { ...merged, branding: normalizeBranding(merged.branding) || { ...EMPTY_BRANDING } };
      }
    }
  )
);

export default useOrgProfileStore;
