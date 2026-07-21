/**
 * IT-infrastructure presets, promoted out of OrgProfileWizard (plan §5).
 *
 * The LABEL is the persisted token: orgProfileStore stores these strings
 * verbatim in profile.infrastructure, and deriveStackTargets substring-matches
 * against them — so promotion ADDS ids alongside the labels without changing
 * what persists (no orgProfileStore version bump, no stack-tailoring change).
 *
 * `platformId`, where present, names the platform-procedure map id the label
 * corresponds to. It powers the wizard Environment step's SEEDING only — a
 * pure read of the saved profile that pre-checks platform chips. Nothing here
 * writes back to the org profile (ratified: the profile is global and
 * optional; the environment selection is per-assessment).
 */
export const INFRA_PRESETS = [
  { id: 'aws', label: 'AWS' },
  { id: 'azure', label: 'Azure' },
  { id: 'google-cloud', label: 'Google Cloud' },
  { id: 'on-prem', label: 'On-premises data center' },
  { id: 'saas-heavy', label: 'SaaS-heavy' },
  { id: 'kubernetes', label: 'Kubernetes / containers' },
  { id: 'ot-ics', label: 'OT / ICS' },
  { id: 'remote-endpoints', label: 'Remote-first endpoints' },
  { id: 'microsoft-365', label: 'Microsoft 365', platformId: 'microsoft-365' },
  { id: 'google-workspace', label: 'Google Workspace', platformId: 'google-workspace' },
  { id: 'slack', label: 'Slack' },
  { id: 'microsoft-teams', label: 'Microsoft Teams' }
];

/** The persisted-token list the org-profile chip picker renders. */
export const INFRA_PRESET_LABELS = INFRA_PRESETS.map((p) => p.label);

/* Platform-signal matchers for seeding. Substring semantics mirror
 * deriveStackTargets (profile chips may be free text, e.g. "Office 365 E5"),
 * kept deliberately conservative: identity-only signals like "Entra ID" do
 * not imply the M365 platform selection. */
const PLATFORM_SIGNALS = [
  { platformId: 'google-workspace', needles: ['google workspace'] },
  { platformId: 'microsoft-365', needles: ['microsoft 365', 'm365', 'office 365', 'o365'] }
];

/**
 * Map a saved org profile's infrastructure chips to platform-procedure map
 * ids, for pre-checking the Environment step's platform chips. Pure read;
 * unmatched chips contribute nothing.
 */
export const platformIdsFromInfrastructure = (infrastructure) => {
  const chips = (Array.isArray(infrastructure) ? infrastructure : [])
    .map((c) => String(c).toLowerCase());
  return PLATFORM_SIGNALS
    .filter(({ needles }) => chips.some((c) => needles.some((n) => c.includes(n))))
    .map(({ platformId }) => platformId);
};
