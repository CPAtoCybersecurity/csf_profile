/**
 * Infra presets promotion (plan PR-6, §5 constraint): the LABEL is the
 * persisted token. Promotion adds ids alongside labels — the label list must
 * stay byte-equal to what OrgProfileWizard inlined before, or every saved
 * profile's chips and deriveStackTargets' substring matching silently break.
 */
import { INFRA_PRESETS, INFRA_PRESET_LABELS, platformIdsFromInfrastructure } from './infraPresets';
import { deriveStackTargets } from './procedureTailor';

// The exact inline array OrgProfileWizard shipped before the promotion.
const LEGACY_INLINE_LABELS = [
  'AWS', 'Azure', 'Google Cloud', 'On-premises data center', 'SaaS-heavy',
  'Kubernetes / containers', 'OT / ICS', 'Remote-first endpoints',
  'Microsoft 365', 'Google Workspace', 'Slack', 'Microsoft Teams'
];

describe('INFRA_PRESETS promotion', () => {
  test('labels byte-equal the legacy inline array, same order (persisted token unchanged)', () => {
    expect(INFRA_PRESET_LABELS).toEqual(LEGACY_INLINE_LABELS);
  });

  test('every preset has a non-empty id and label; platformId only on the two map platforms', () => {
    INFRA_PRESETS.forEach((p) => {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.label).toBe('string');
      expect(p.label.length).toBeGreaterThan(0);
    });
    const withPlatform = INFRA_PRESETS.filter((p) => p.platformId);
    expect(withPlatform.map((p) => p.platformId).sort()).toEqual([
      'google-workspace',
      'microsoft-365'
    ]);
  });

  test('promoted labels keep deriveStackTargets behavior (chips match as before)', () => {
    // The stack-tailoring email signal keys off the same persisted labels.
    const targets = deriveStackTargets({ infrastructure: ['Google Workspace', 'Google Cloud'] });
    expect(targets.email).toBe('google');
    expect(targets.cloud).toBe('gcp');
  });
});

describe('platformIdsFromInfrastructure (Environment step seeding)', () => {
  test('maps the preset labels to map platform ids', () => {
    expect(platformIdsFromInfrastructure(['Google Workspace'])).toEqual(['google-workspace']);
    expect(platformIdsFromInfrastructure(['Microsoft 365'])).toEqual(['microsoft-365']);
    expect(platformIdsFromInfrastructure(['Microsoft 365', 'Google Workspace']).sort()).toEqual([
      'google-workspace',
      'microsoft-365'
    ]);
  });

  test('matches free-text variants case-insensitively (chips may be typed)', () => {
    expect(platformIdsFromInfrastructure(['Office 365 E5'])).toEqual(['microsoft-365']);
    expect(platformIdsFromInfrastructure(['o365'])).toEqual(['microsoft-365']);
    expect(platformIdsFromInfrastructure(['M365 tenant'])).toEqual(['microsoft-365']);
    expect(platformIdsFromInfrastructure(['GOOGLE WORKSPACE for Education'])).toEqual(['google-workspace']);
  });

  test('non-signals contribute nothing: identity products, clouds, chat, junk input', () => {
    expect(platformIdsFromInfrastructure(['Entra ID', 'AWS', 'Slack', 'Google Cloud'])).toEqual([]);
    expect(platformIdsFromInfrastructure([])).toEqual([]);
    expect(platformIdsFromInfrastructure(null)).toEqual([]);
    expect(platformIdsFromInfrastructure(undefined)).toEqual([]);
  });

  test('pure read: never mutates the input array', () => {
    const input = ['Google Workspace', 'AWS'];
    const frozen = JSON.parse(JSON.stringify(input));
    platformIdsFromInfrastructure(input);
    expect(input).toEqual(frozen);
  });
});
