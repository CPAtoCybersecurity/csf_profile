import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const useOrgProfileStore = create(
  persist(
    (set, get) => ({
      profile: null, // null = never set up
      cloudConsent: false,

      saveProfile: (partial) =>
        set({ profile: { ...EMPTY_PROFILE, ...(get().profile || {}), ...partial } }),

      setCloudConsent: (value) => set({ cloudConsent: !!value }),

      clearProfile: () => set({ profile: null, cloudConsent: false }),

      hasProfile: () => profileHasContent(get().profile),

      // Bulk setter for the backup-restore path (dataImport.js).
      setProfileState: (state) =>
        set({
          profile: state && profileHasContent(state.profile) ? { ...EMPTY_PROFILE, ...state.profile } : null,
          cloudConsent: !!(state && state.cloudConsent)
        })
    }),
    {
      name: 'csf-org-profile-storage',
      version: ORG_PROFILE_SCHEMA_VERSION
    }
  )
);

export default useOrgProfileStore;
