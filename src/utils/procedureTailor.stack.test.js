/**
 * Deterministic stack-aware tailoring — the canned, no-AI substitution
 * engine. The community bank is written against AWS + SentinelOne + O365 +
 * Slack; these tests prove the engine re-aims that stack from org-profile
 * answers alone, and that it NEVER fires without an explicit signal.
 */
import {
  tailorMarkdown,
  deriveStackTargets,
  buildStackRules,
  describeStackPlan,
  bankAttachObservation,
  deterministicTailorUpdate
} from './procedureTailor';
import { getBankProcedure } from './procedureBank';
import bankData from '../data/communityProcedures.json';

const BANK = bankData.procedures;
const BANK_IDS = Object.keys(BANK);

const gcpProfile = {
  orgName: 'a16z',
  infrastructure: ['Google Cloud', 'SaaS-heavy', 'Remote-first endpoints'],
  securityTools: []
};
const azureProfile = { orgName: 'Contoso', infrastructure: ['Azure'], securityTools: [] };
const onpremProfile = { orgName: 'Steelworks', infrastructure: ['On-premises data center'], securityTools: [] };
const awsProfile = { orgName: 'Rainforest', infrastructure: ['AWS', 'Kubernetes / containers'], securityTools: [] };

// AWS-stack vocabulary that must be GONE after a cloud swap. Per-target
// exclusions are deliberate: GCP keeps "KMS" (Cloud KMS) and "VPC Flow
// Logs" (same product name); bare "IAM" and "WAF" are generic terms kept
// on every target.
const BANNED_COMMON = [
  /\bAWS\b/, /\bAmazon\b/, /\bCloudTrail\b/, /\bGuardDuty\b/, /\bSecurity Hub\b/,
  /\bS3\b/, /\bEC2\b/, /\bEKS\b/, /\bRDS\b/, /\bLambda\b/, /\bCloudWatch\b/,
  /\bAthena\b/, /\bCloudFront\b/, /\bRoute 53\b/, /\bSNS\b/, /\bSystems Manager\b/,
  /\bShield\b/,
  // Fail-loud reserve: AWS services with ZERO bank hits today. If a future
  // bank regeneration introduces one, the sweep goes red and forces a map
  // entry — unknown unknowns become caught knowns.
  /\bSecrets Manager\b/, /\bDynamoDB\b/, /\bRedshift\b/, /\bMacie\b/, /\bCognito\b/,
  /\bCloudFormation\b/, /\bFargate\b/, /\bKinesis\b/, /\bSQS\b/, /\bElastiCache\b/
];
// Grammar gates: article/determiner damage a naive noun swap causes.
// Capitals-only vowel checks so ordinary prose ("a one-time", "an hour")
// can never false-positive; acronyms ("an NSG", "an SP 800-53") are
// excluded by requiring a lowercase second letter.
const GRAMMAR_GATES = [
  /\b[Aa]n? the\b/, /\bthe the\b/, /\ban [BCDFGJKLMNPQRSTVWXZ][a-z]/, /\ba [AEIO][a-z]/
];
// AWS-networking vocabulary that Azure/on-prem must also scrub (GCP keeps
// VPC — it is the real GCP product name; its firewall analog still bans
// "security group").
const BANNED = {
  gcp: [...BANNED_COMMON, /\bsecurity groups?\b/, ...GRAMMAR_GATES],
  azure: [...BANNED_COMMON, /\bKMS\b/, /\bVPCs?\b/, /\bsecurity groups?\b/, ...GRAMMAR_GATES],
  onprem: [...BANNED_COMMON, /\bKMS\b/, /\bVPCs?\b/, /\bsecurity groups?\b/, ...GRAMMAR_GATES]
};
// The bank's SentinelOne/O365/Slack vocabulary, banned when the profile
// names replacements for all of it.
const BANNED_TOOLS = [
  /\bSentinelOne\b/, /\bDeep Visibility\b/, /\bO365\b/, /\bMicrosoft 365\b/,
  /\bM365\b/, /\bOffice 365\b/, /\bATP\b/, /\bSlack\b/
];
const fullStackProfile = {
  orgName: 'a16z',
  infrastructure: ['Google Cloud', 'Google Workspace', 'Microsoft Teams'],
  securityTools: ['CrowdStrike']
};

const sweep = (profile, bannedList) => {
  const failures = [];
  for (const id of BANK_IDS) {
    const { text } = tailorMarkdown(BANK[id].markdown, profile, { substituteName: false, adaptStack: true });
    for (const re of bannedList) {
      const m = text.match(re);
      if (m) failures.push(`${id}: "${m[0]}" survived (${re})`);
    }
  }
  return failures;
};

describe('deriveStackTargets — explicit signals only, never guesses', () => {
  test('Google Cloud without AWS → gcp target (the reported field case)', () => {
    expect(deriveStackTargets(gcpProfile).cloud).toBe('gcp');
  });

  test('GCP alias and case-insensitivity', () => {
    expect(deriveStackTargets({ infrastructure: ['gcp'] }).cloud).toBe('gcp');
    expect(deriveStackTargets({ infrastructure: ['GOOGLE CLOUD'] }).cloud).toBe('gcp');
  });

  test('Azure without AWS → azure target', () => {
    expect(deriveStackTargets(azureProfile).cloud).toBe('azure');
  });

  test('AWS selected → NO cloud swap, even alongside another cloud', () => {
    expect(deriveStackTargets(awsProfile).cloud).toBeNull();
    expect(deriveStackTargets({ infrastructure: ['AWS', 'Google Cloud'] }).cloud).toBeNull();
    expect(deriveStackTargets({ infrastructure: ['Google Cloud', 'AWS'] }).cloud).toBeNull();
  });

  test('multi-cloud without AWS → first selected chip wins, deterministically', () => {
    expect(deriveStackTargets({ infrastructure: ['Azure', 'Google Cloud'] }).cloud).toBe('azure');
    expect(deriveStackTargets({ infrastructure: ['Google Cloud', 'Azure'] }).cloud).toBe('gcp');
  });

  test('on-premises only → onprem neutralization target', () => {
    expect(deriveStackTargets(onpremProfile).cloud).toBe('onprem');
  });

  test('no infrastructure answer → no cloud swap', () => {
    expect(deriveStackTargets({ infrastructure: ['SaaS-heavy'] }).cloud).toBeNull();
    expect(deriveStackTargets({}).cloud).toBeNull();
  });

  test('named EDR product → exact swap target with canonical name', () => {
    const t = deriveStackTargets({ securityTools: ['CrowdStrike'] });
    expect(t.edr).toEqual({ name: 'CrowdStrike Falcon', neutral: false });
  });

  test('generic EDR chip → neutral role noun, never a guessed vendor', () => {
    const t = deriveStackTargets({ securityTools: ['EDR'] });
    expect(t.edr).toEqual({ name: 'your EDR platform', neutral: true });
  });

  test('SentinelOne named → bank references kept (no swap)', () => {
    expect(deriveStackTargets({ securityTools: ['SentinelOne', 'EDR'] }).edr).toBeNull();
  });

  test('Microsoft Sentinel (a SIEM) never triggers the EDR swap', () => {
    expect(deriveStackTargets({ securityTools: ['Microsoft Sentinel'] }).edr).toBeNull();
  });

  test('Google Workspace signal → google email target; mixed-stack keeps O365', () => {
    expect(deriveStackTargets({ infrastructure: ['Google Workspace'] }).email).toBe('google');
    expect(deriveStackTargets({ infrastructure: ['Google Workspace', 'Microsoft 365'] }).email).toBeNull();
    expect(deriveStackTargets({ infrastructure: [] }).email).toBeNull();
  });

  test('chat: Teams named → swap; Slack named → keep; nothing named → keep', () => {
    expect(deriveStackTargets({ infrastructure: ['Microsoft Teams'] }).chat).toBe('Microsoft Teams');
    expect(deriveStackTargets({ infrastructure: ['Microsoft Teams', 'Slack'] }).chat).toBeNull();
    expect(deriveStackTargets({ infrastructure: ['Google Chat'] }).chat).toBe('Google Chat');
    expect(deriveStackTargets({}).chat).toBeNull();
  });
});

describe('full-bank sweeps — zero AWS-stack residue after a cloud swap', () => {
  test(`GCP profile scrubs the AWS vocabulary from all ${BANK_IDS.length} bank procedures`, () => {
    expect(sweep(gcpProfile, BANNED.gcp)).toEqual([]);
  });

  test('Azure profile — same sweep (incl. VPC/security-group vocabulary)', () => {
    expect(sweep(azureProfile, BANNED.azure)).toEqual([]);
  });

  test('on-prem profile — same sweep (capability-language neutralization)', () => {
    expect(sweep(onpremProfile, BANNED.onprem)).toEqual([]);
  });

  test('full-stack profile also scrubs SentinelOne / O365 / Slack across the whole bank', () => {
    expect(sweep(fullStackProfile, [...BANNED.gcp, ...BANNED_TOOLS])).toEqual([]);
  });

  test('AWS profile — every bank procedure passes through byte-identical', () => {
    for (const id of BANK_IDS) {
      const { text, tailored } = tailorMarkdown(BANK[id].markdown, awsProfile, { substituteName: false, adaptStack: true });
      expect(tailored).toBe(false);
      expect(text).toBe(BANK[id].markdown);
    }
  });
});

describe('the reported field case — DE.AE-02 with a GCP profile', () => {
  const result = tailorMarkdown(BANK['DE.AE-02'].markdown, gcpProfile, { substituteName: false, adaptStack: true });

  test('reads as a Google Cloud procedure', () => {
    expect(result.tailored).toBe(true);
    expect(result.text).toContain('Cloud Audit Logging');
    expect(result.text).toContain('Security Command Center');
    expect(result.text).not.toMatch(/\bAWS\b|\bGuardDuty\b|\bCloudTrail\b/);
  });

  test('honest scope: SentinelOne and O365 stay when no EDR/email signal exists', () => {
    // The profile names only a cloud — swapping the EDR or email platform
    // would be a guess, and the engine never guesses.
    expect(result.text).toContain('SentinelOne');
    expect(result.text).toContain('O365');
  });

  test('applied[] reports what changed', () => {
    const total = result.applied.reduce((n, a) => n + a.count, 0);
    expect(total).toBeGreaterThan(5);
    expect(result.applied.some((a) => a.from === 'GuardDuty' && a.to === 'Security Command Center')).toBe(true);
  });
});

describe('substitution safety', () => {
  test('longest phrase wins — no partial-overlap corruption', () => {
    const { text } = tailorMarkdown(
      'Check AWS Security Hub and AWS CloudTrail, then AWS console access.',
      gcpProfile,
      { substituteName: false, adaptStack: true }
    );
    expect(text).toBe('Check Security Command Center and Cloud Audit Logging, then Google Cloud console access.');
  });

  test('case-sensitive + word-bounded: evidence paths and identifiers untouched', () => {
    const { text } = tailorMarkdown(
      'See [evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md) and the CloudTrailLogs helper; laws and flaws unchanged.',
      gcpProfile,
      { substituteName: false, adaptStack: true }
    );
    expect(text).toContain('EVD-aws-config-compliance.md');
    expect(text).toContain('CloudTrailLogs');
    expect(text).toContain('laws and flaws');
  });

  test('idempotent — re-tailoring tailored output is a no-op (all procedures, all swap families)', () => {
    // Doubles as the rule-feeding property test: no rule's replacement may
    // re-trigger a later rule on a second pass.
    for (const id of BANK_IDS) {
      const once = tailorMarkdown(BANK[id].markdown, fullStackProfile, { adaptStack: true });
      const twice = tailorMarkdown(once.text, fullStackProfile, { adaptStack: true });
      expect(twice.text).toBe(once.text);
    }
  });

  test('EDR swap: SentinelOne → named product incl. Deep Visibility', () => {
    const profile = { securityTools: ['CrowdStrike Falcon'] };
    const { text } = tailorMarkdown(
      'SentinelOne EDR detections and Deep Visibility queries; SentinelOne MDR escalation.',
      profile,
      { substituteName: false, adaptStack: true }
    );
    expect(text).toBe('CrowdStrike Falcon EDR detections and CrowdStrike Falcon telemetry search queries; CrowdStrike Falcon MDR escalation.');
  });

  test('generic-EDR neutralization: role noun, not a vendor guess', () => {
    const { text } = tailorMarkdown(
      'Review SentinelOne exclusions and Deep Visibility coverage.',
      { securityTools: ['EDR'] },
      { substituteName: false, adaptStack: true }
    );
    expect(text).toBe('Review your EDR platform exclusions and the EDR telemetry search coverage.');
  });

  test('email swap on Google Workspace signal', () => {
    const { text } = tailorMarkdown(
      'O365 ATP policy configuration; O365 unified audit log retention; Microsoft 365 licensing.',
      { infrastructure: ['Google Workspace'] },
      { substituteName: false, adaptStack: true }
    );
    expect(text).toContain('Google Workspace email protection policy configuration');
    expect(text).toContain('Google Workspace unified audit log retention');
    expect(text).not.toMatch(/O365|Microsoft 365/);
  });

  test('chat swap: Slack → Microsoft Teams only when Teams is named', () => {
    const teams = tailorMarkdown('Escalate via Slack workspace audit logs.', { infrastructure: ['Microsoft Teams'] }, { substituteName: false, adaptStack: true });
    expect(teams.text).toBe('Escalate via Microsoft Teams workspace audit logs.');
    const nothing = tailorMarkdown('Escalate via Slack.', {}, { substituteName: false, adaptStack: true });
    expect(nothing.text).toBe('Escalate via Slack.');
  });

  test('backward compatibility: two-argument call stays name-only', () => {
    const { text } = tailorMarkdown('AWS CloudTrail at Alma Security.', { orgName: 'Acme', infrastructure: ['Google Cloud'] });
    expect(text).toBe('AWS CloudTrail at Acme.');
  });

  test('name + stack combine in one call', () => {
    const { text, tailored } = tailorMarkdown(
      "Alma Security's GuardDuty baseline.",
      gcpProfile,
      { substituteName: true, adaptStack: true }
    );
    expect(tailored).toBe(true);
    expect(text).toBe("a16z's Security Command Center baseline.");
  });
});

describe('swap-plan disclosure (wizard card)', () => {
  test('GCP profile discloses the cloud swap', () => {
    const lines = describeStackPlan(deriveStackTargets(gcpProfile));
    expect(lines.some((l) => l.includes('Google Cloud equivalents'))).toBe(true);
  });

  test('azure / onprem / product-EDR / email / chat lines all render', () => {
    expect(describeStackPlan(deriveStackTargets(azureProfile)).some((l) => l.includes('Azure equivalents'))).toBe(true);
    expect(describeStackPlan(deriveStackTargets(onpremProfile)).some((l) => l.includes('neutral capability language'))).toBe(true);
    const full = describeStackPlan(deriveStackTargets(fullStackProfile));
    expect(full.some((l) => l.includes('SentinelOne → CrowdStrike Falcon'))).toBe(true);
    expect(full.some((l) => l.includes('Google Workspace equivalents'))).toBe(true);
    expect(full.some((l) => l.includes('Slack → Microsoft Teams'))).toBe(true);
  });

  test('no signals → empty plan (the card explains how to enable swaps)', () => {
    expect(describeStackPlan(deriveStackTargets({ infrastructure: ['SaaS-heavy'] }))).toEqual([]);
    expect(describeStackPlan(deriveStackTargets(awsProfile))).toEqual([]);
  });

  test('neutral EDR line teaches how to get an exact swap', () => {
    const lines = describeStackPlan(deriveStackTargets({ securityTools: ['EDR'] }));
    expect(lines.some((l) => l.includes('name your EDR product'))).toBe(true);
  });
});

describe('buildStackRules', () => {
  test('rules are compiled longest-first', () => {
    const rules = buildStackRules({ cloud: 'gcp', edr: null, email: null, chat: null });
    const lengths = rules.map((r) => r.from.length);
    expect([...lengths].sort((a, b) => b - a)).toEqual(lengths);
  });

  test('no targets → no rules', () => {
    expect(buildStackRules({ cloud: null, edr: null, email: null, chat: null })).toEqual([]);
  });
});

describe('detection false-positive locks (reviewer-caught ambiguous signals)', () => {
  test('"aws" as a substring never suppresses the cloud swap ("flaws" trap)', () => {
    const t = deriveStackTargets({ infrastructure: ['Google Cloud'], securityTools: ['flaws.cloud training'] });
    expect(t.cloud).toBe('gcp');
  });

  test('spelled-out "Amazon Web Services" does suppress it', () => {
    expect(deriveStackTargets({ infrastructure: ['Google Cloud', 'Amazon Web Services'] }).cloud).toBeNull();
  });

  test('identity chips (Azure AD / Entra) are not a cloud-platform signal', () => {
    expect(deriveStackTargets({ infrastructure: ['On-premises data center', 'Azure AD'] }).cloud).toBe('onprem');
    expect(deriveStackTargets({ infrastructure: ['Entra ID'] }).cloud).toBeNull();
    expect(deriveStackTargets({ infrastructure: ['Azure Active Directory', 'Google Cloud'] }).cloud).toBe('gcp');
    expect(deriveStackTargets({ infrastructure: ['Azure'] }).cloud).toBe('azure');
  });

  test('an Elastic SIEM chip never re-brands the EDR; endpoint-flavored Elastic does', () => {
    expect(deriveStackTargets({ securityTools: ['Elastic SIEM'] }).edr).toBeNull();
    expect(deriveStackTargets({ securityTools: ['Elastic Defend'] }).edr).toEqual({ name: 'Elastic Defend', neutral: false });
  });

  test('Defender for Cloud (CSPM) and Cortex XSOAR (SOAR) never trigger the EDR swap', () => {
    expect(deriveStackTargets({ securityTools: ['Microsoft Defender for Cloud'] }).edr).toBeNull();
    expect(deriveStackTargets({ securityTools: ['Cortex XSOAR'] }).edr).toBeNull();
    expect(deriveStackTargets({ securityTools: ['Microsoft Defender'] }).edr)
      .toEqual({ name: 'Microsoft Defender for Endpoint', neutral: false });
    expect(deriveStackTargets({ securityTools: ['Cortex XDR'] }).edr)
      .toEqual({ name: 'Cortex XDR', neutral: false });
  });

  test('bare "teams" in prose is not a chat signal; only "Microsoft Teams" is', () => {
    expect(deriveStackTargets({ securityTools: ['on-call response teams tooling'] }).chat).toBeNull();
    expect(deriveStackTargets({ infrastructure: ['Microsoft Teams'] }).chat).toBe('Microsoft Teams');
  });

  test('EDR priority follows profile entry order, consistent with the cloud rule', () => {
    expect(deriveStackTargets({ securityTools: ['Tanium', 'CrowdStrike'] }).edr.name).toBe('Tanium');
    expect(deriveStackTargets({ securityTools: ['CrowdStrike', 'Tanium'] }).edr.name).toBe('CrowdStrike Falcon');
  });
});

describe('producer paths — provenance enforced at the producer', () => {
  const entry = getBankProcedure('DE.AE-02');

  test('bank attach with adaptStack: tailored text + tailored:true provenance', () => {
    const obs = bankAttachObservation(entry, gcpProfile, { substituteName: false, adaptStack: true });
    expect(obs.testProcedures).toContain('Security Command Center');
    expect(obs.procedureSource).toMatchObject({ bank: 'community', bankId: 'DE.AE-02', tailored: true });
  });

  test('bank attach pristine: byte-identical text, tailored:false', () => {
    const obs = bankAttachObservation(entry, gcpProfile, { substituteName: false, adaptStack: false });
    expect(obs.testProcedures).toBe(entry.markdown);
    expect(obs.procedureSource.tailored).toBe(false);
  });

  test('flag mapping is not transposed: substituteName↛stack, adaptStack↛name', () => {
    const nameOnly = bankAttachObservation(entry, gcpProfile, { substituteName: true, adaptStack: false });
    expect(nameOnly.testProcedures).not.toContain('Alma Security');
    expect(nameOnly.testProcedures).toContain('AWS');
    const stackOnly = bankAttachObservation(entry, gcpProfile, { substituteName: false, adaptStack: true });
    expect(stackOnly.testProcedures).toContain('Alma Security');
    expect(stackOnly.testProcedures).not.toMatch(/\bAWS\b/);
  });

  test('per-item adapt: update carries tailored provenance + stack swap count', () => {
    const result = deterministicTailorUpdate(entry.markdown, undefined, 'DE.AE-02 Ex1', gcpProfile);
    expect(result.update.procedureSource).toMatchObject({ bank: 'community', bankId: 'DE.AE-02', tailored: true });
    expect(result.swapCount).toBeGreaterThan(5);
  });

  test('per-item adapt: name-only change reports swapCount 0 (drives the toast wording)', () => {
    const result = deterministicTailorUpdate('Alma Security policy review.', undefined, 'DE.AE-02 Ex1', { orgName: 'Acme', infrastructure: ['AWS'] });
    expect(result.update.testProcedures).toBe('Acme policy review.');
    expect(result.swapCount).toBe(0);
    expect(result.update.procedureSource.tailored).toBe(true);
  });

  test('per-item adapt: true no-op returns null (nothing written)', () => {
    expect(deterministicTailorUpdate('Generic text.', undefined, 'DE.AE-02 Ex1', { infrastructure: ['AWS'] })).toBeNull();
  });
});
