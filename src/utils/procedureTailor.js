/**
 * Tailoring of community test procedures to an organization profile.
 *
 * Two tiers:
 *  - Deterministic (no AI, no key, offline): substitute the org's name for
 *    the fictional "Alma Security" AND re-aim tool/platform references at
 *    the org's actual stack via curated phrase maps (stackTailorMaps.js) —
 *    AWS→GCP/Azure/on-prem service analogs, EDR/email/chat product swaps.
 *    Swaps fire only on explicit profile signals: a cloud swap needs a
 *    non-AWS cloud selected without AWS; product swaps need the product
 *    named. No signal → no swap. Never guesses.
 *  - AI (optional): rewrite an attached procedure with profile context via
 *    the configured provider. Cloud providers require explicit consent
 *    (orgProfileStore.cloudConsent) — the profile never leaves the machine
 *    without it. Local Ollama needs no consent.
 *
 * Any tailored output carries procedureSource.tailored = true so share
 * export can swap it back to the pristine community version (the profile
 * must not leak through derived procedure text — see PRIVATE_DATA.md).
 */

import { getBankProcedure, buildProcedureSource } from './procedureBank';
import { licenseGate, licenseProvenance, mayTailor, refusalPlaceholder } from './licenseClass.mjs';
import { buildPlatformRef } from './platformBank';
import { CLOUD_TERMS, EDR_PRODUCTS, GOOGLE_EMAIL_TERMS } from './stackTailorMaps';

/**
 * Provenance for AI-tailored output. ALWAYS returns a tailored-marked source:
 * a tailored procedure without provenance would bypass the share-export
 * pristine swap and leak profile-derived text — the exact hole this closes.
 * With no prior source, synthesize community provenance when the item has
 * bank coverage (share export then swaps to the pristine text); otherwise a
 * bank:"none" marker whose unresolvable bankId makes the swap drop the text
 * entirely rather than leak it.
 */
export const tailoredProvenance = (existingSource, itemId) => {
  if (existingSource) return { ...existingSource, tailored: true, modified: true };
  const bankEntry = getBankProcedure(itemId);
  if (bankEntry) {
    return { ...buildProcedureSource(bankEntry.bankId), tailored: true, modified: true };
  }
  return {
    bank: 'none',
    bankId: null,
    bankVersion: null,
    attachedAt: new Date().toISOString(),
    tailored: true,
    modified: true
  };
};

/**
 * Derive deterministic swap targets from the org profile. Detection is
 * case-insensitive over the infrastructure and securityTools entries;
 * insertion always uses canonical dictionary strings, never profile text.
 *
 * Returns { cloud: 'gcp'|'azure'|'onprem'|null,
 *           edr: { name, neutral }|null,
 *           email: 'google'|null,
 *           chat: 'Microsoft Teams'|'Google Chat'|null }
 */
export const deriveStackTargets = (profile) => {
  const infra = (profile?.infrastructure || []).map(String);
  const tools = (profile?.securityTools || []).map(String);
  const all = [...infra, ...tools].map((s) => s.toLowerCase());
  const has = (...needles) => all.some((s) => needles.some((n) => s.includes(n)));

  // Cloud: swap only when a non-AWS cloud is chosen and AWS is absent.
  // The bank is AWS-written, so an org that runs AWS needs no cloud swap.
  // "aws" is matched as a word ("flaws" must not suppress the swap), and
  // identity products (Azure AD / Entra) are not a platform signal.
  // Selection order is the profile's persisted chip order (stable), so a
  // multi-cloud-without-AWS profile deterministically uses its first cloud.
  let cloud = null;
  if (!all.some((s) => /\baws\b/.test(s)) && !has('amazon web services')) {
    for (const chip of infra) {
      const c = chip.toLowerCase();
      if (/azure a(d\b|ctive directory)/.test(c) || c.includes('entra')) continue;
      if (c.includes('google cloud') || /\bgcp\b/.test(c)) { cloud = 'gcp'; break; }
      if (c.includes('azure')) { cloud = 'azure'; break; }
    }
    if (!cloud && has('on-prem', 'on prem', 'data center', 'datacenter')) cloud = 'onprem';
  }

  // EDR: the first profile entry naming a known product wins (chip order,
  // consistent with the cloud rule); a generic "EDR" chip neutralizes to a
  // role noun (never guesses a vendor); SentinelOne named — or nothing
  // named — keeps the bank's SentinelOne.
  let edr = null;
  if (!has('sentinelone', 'sentinel one')) {
    let product = null;
    for (const entry of all) {
      product = EDR_PRODUCTS.find((p) =>
        p.detect.some((d) => entry.includes(d)) &&
        !(p.exclude || []).some((x) => entry.includes(x)));
      if (product) break;
    }
    if (product) edr = { name: product.name, neutral: false };
    else if (has('edr')) edr = { name: 'your EDR platform', neutral: true };
  }

  // Email: explicit Google Workspace / Gmail signal with no Microsoft-stack
  // signal. Orgs running both keep the bank's O365 references.
  let email = null;
  const google = has('google workspace', 'gmail');
  const microsoft = has('microsoft 365', 'm365', 'office 365', 'o365', 'exchange', 'outlook');
  if (google && !microsoft) email = 'google';

  // Chat: swap only when a different platform is explicitly named and
  // Slack itself is not. Bare "teams" is ordinary prose ("on-call teams")
  // and never counts as a signal.
  let chat = null;
  if (!has('slack')) {
    if (has('microsoft teams')) chat = 'Microsoft Teams';
    else if (has('google chat')) chat = 'Google Chat';
  }

  return { cloud, edr, email, chat };
};

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Word-bounded, case-sensitive matcher. Boundaries only where the phrase
// edge is alphanumeric, so "CloudTrail" never matches inside
// "CloudTrailLogs" and lowercase paths like EVD-aws-* are never touched.
const phraseRegExp = (phrase) => {
  const lead = /^[A-Za-z0-9]/.test(phrase) ? '\\b' : '';
  const tail = /[A-Za-z0-9]$/.test(phrase) ? '\\b' : '';
  return new RegExp(lead + escapeRegExp(phrase) + tail, 'g');
};

/** Compile the ordered substitution rule list for the derived targets. */
export const buildStackRules = (targets) => {
  const rules = [];
  if (targets?.cloud) {
    for (const [phrase, byTarget] of CLOUD_TERMS) {
      const to = byTarget[targets.cloud];
      if (to) rules.push({ from: phrase, to });
    }
  }
  if (targets?.edr) {
    rules.push({ from: 'Deep Visibility', to: targets.edr.neutral ? 'the EDR telemetry search' : `${targets.edr.name} telemetry search` });
    rules.push({ from: 'SentinelOne', to: targets.edr.name });
  }
  if (targets?.email === 'google') {
    for (const [from, to] of GOOGLE_EMAIL_TERMS) rules.push({ from, to });
  }
  if (targets?.chat) {
    rules.push({ from: 'Slack', to: targets.chat });
  }
  // Longest phrase first — the bare-vendor fallbacks ("AWS", "Amazon")
  // must never fire inside a service phrase like "AWS Security Hub".
  rules.sort((a, b) => b.from.length - a.from.length);
  return rules.map((r) => ({ ...r, re: phraseRegExp(r.from) }));
};

/** Human-readable summary of what a swap plan will do (wizard disclosure). */
export const describeStackPlan = (targets) => {
  const lines = [];
  if (targets?.cloud === 'gcp') lines.push('AWS services → Google Cloud equivalents (CloudTrail → Cloud Audit Logging, GuardDuty → Security Command Center, S3 → Cloud Storage, …)');
  if (targets?.cloud === 'azure') lines.push('AWS services → Azure equivalents (CloudTrail → Azure Activity Log, GuardDuty → Microsoft Defender for Cloud, S3 → Blob Storage, …)');
  if (targets?.cloud === 'onprem') lines.push('AWS services → neutral capability language (cloud consoles have no exact on-premises analog — adapt specifics to your environment)');
  if (targets?.edr) {
    lines.push(targets.edr.neutral
      ? 'SentinelOne → "your EDR platform" (name your EDR product in the profile for an exact swap)'
      : `SentinelOne → ${targets.edr.name}`);
  }
  if (targets?.email === 'google') lines.push('O365 / Microsoft 365 email security → Google Workspace equivalents');
  if (targets?.chat) lines.push(`Slack → ${targets.chat}`);
  return lines;
};

/**
 * Deterministic substitution. Returns { text, tailored, applied }.
 * Options: substituteName (default true) — org name for "Alma Security";
 * adaptStack (default false) — canned tool/platform swaps per the profile.
 * Existing two-argument callers keep the original name-only behavior.
 */
export const tailorMarkdown = (markdown, profile, options = {}) => {
  const { substituteName = true, adaptStack = false } = options;
  if (!markdown) return { text: markdown, tailored: false, applied: [] };

  let text = markdown;
  const applied = [];

  const orgName = profile?.orgName?.trim();
  if (substituteName && orgName) {
    text = text
      .replace(/Alma Security/g, orgName)
      .replace(/\bAlma's\b/g, `${orgName}'s`)
      .replace(/\bAlma\b/g, orgName);
  }

  if (adaptStack && profile) {
    const rules = buildStackRules(deriveStackTargets(profile));
    for (const rule of rules) {
      let count = 0;
      text = text.replace(rule.re, () => { count += 1; return rule.to; });
      if (count > 0) applied.push({ from: rule.from, to: rule.to, count });
    }
  }

  return { text, tailored: text !== markdown, applied };
};

/**
 * Pure producer for the wizard's bank-attach path. Computes the
 * observation update for one scoped item: bank markdown, optionally
 * tailored, with provenance stamped HERE — the page is a dumb dispatcher,
 * so the tailored flag can never be forgotten at a call site.
 */
export const bankAttachObservation = (bankEntry, profile, options = {}) => {
  // License gate — the attach binding of the single license authority.
  // Unlicensed entries (the whole community bank) pass through untouched.
  // A refused entry attaches a fail-closed explicit placeholder with ZERO
  // licensed text; the return stays total because call sites dereference
  // `.testProcedures` directly. noDerivatives content forces the tailor off:
  // verbatim and omission are the only forms a no-derivatives license permits.
  const gate = licenseGate(bankEntry);
  if (!gate.allow) {
    return {
      testProcedures: refusalPlaceholder(gate.reason),
      procedureSource: { ...buildProcedureSource(bankEntry.bankId), tailored: false }
    };
  }
  const { substituteName = false, adaptStack = false } = options;
  const wantTailor = (substituteName || adaptStack) && profile && !gate.verbatimOnly;
  const { text, tailored } = wantTailor
    ? tailorMarkdown(bankEntry.markdown, profile, { substituteName, adaptStack })
    : { text: bankEntry.markdown, tailored: false };
  return {
    testProcedures: text,
    procedureSource: {
      ...buildProcedureSource(bankEntry.bankId),
      tailored,
      ...licenseProvenance(bankEntry)
    }
  };
};

/**
 * Pure producer for the composed (trunk + platform addenda) attach path —
 * what the PR-6 wizard Environment step will call. The trunk is the
 * community attach exactly as bankAttachObservation produces it; platform
 * offers (from getPlatformProcedures) attach as REFERENCES, never copied
 * text (plan §7 R-3), and `procedureSource.components[]` records the
 * composition recipe at attach time (plan §7 R-6) so the pristine swap and
 * Reset replay a recorded derivation instead of re-deriving with their own
 * copy of the composition rule.
 *
 * Zero offers compose to the trunk attach plus the trunk-only recipe — no
 * platformProcedures key, so nothing rides observations that have no
 * platform lane.
 */
export const composeAttachObservation = (bankEntry, platformOffers, profile, options = {}) => {
  const trunk = bankAttachObservation(bankEntry, profile, options);
  const offers = Array.isArray(platformOffers) ? platformOffers : [];
  const refs = offers.map((offer) => buildPlatformRef(offer.record, offer.corpusId));
  const components = [
    {
      kind: 'trunk',
      bank: trunk.procedureSource.bank,
      bankId: trunk.procedureSource.bankId,
      bankVersion: trunk.procedureSource.bankVersion
    },
    ...refs.map((r) => ({ kind: 'platform-ref', ...r }))
  ];
  const composed = {
    ...trunk,
    procedureSource: { ...trunk.procedureSource, components }
  };
  if (refs.length > 0) composed.platformProcedures = refs;
  return composed;
};

/**
 * The wizard's single attach producer (plan PR-6). Offers present → the
 * composed attach (trunk + platform references + recipe). Zero offers → the
 * plain community attach, BYTE-IDENTICAL to what the wizard produced before
 * the Environment step existed: an assessment that attaches no platform
 * checks gains no new keys, not even a trunk-only recipe — the recipe
 * appears when a composition exists to record (advisor ruling, G24).
 */
export const wizardAttachObservation = (bankEntry, platformOffers, profile, options = {}) => {
  const offers = Array.isArray(platformOffers) ? platformOffers : [];
  return offers.length > 0
    ? composeAttachObservation(bankEntry, offers, profile, options)
    : bankAttachObservation(bankEntry, profile, options);
};

/**
 * Pure producer for the per-item "Adapt to my environment" action.
 * Returns null when nothing would change; otherwise the observation
 * update (tailored provenance always stamped) plus the stack-swap count
 * for the toast.
 */
export const deterministicTailorUpdate = (currentText, existingSource, itemId, profile) => {
  // Transform binding of the license gate: tailoring no-derivatives content
  // would create a derivative, so the action is a no-op via the existing
  // "nothing would change" null contract every call site already handles.
  if (existingSource && !mayTailor(existingSource)) return null;
  const { text, tailored, applied } = tailorMarkdown(currentText, profile, { substituteName: true, adaptStack: true });
  if (!tailored) return null;
  return {
    update: {
      testProcedures: text,
      procedureSource: tailoredProvenance(existingSource, itemId)
    },
    swapCount: applied.reduce((n, a) => n + a.count, 0)
  };
};

/**
 * Consent gate: may profile text be sent to this provider?
 * Ollama runs locally — always allowed. Claude is a cloud egress — requires
 * the explicit stored opt-in.
 */
export const canUseProfileWithProvider = (provider, cloudConsent) =>
  provider === 'ollama' || !!cloudConsent;

/** Profile summary block shared by AI prompts (only called post-consent-gate). */
const profileContext = (profile) => {
  const lines = [];
  if (profile.orgName?.trim()) lines.push(`Organization: ${profile.orgName.trim()}`);
  if (profile.industry?.trim()) lines.push(`Industry: ${profile.industry.trim()}`);
  if (profile.sizeBand?.trim()) lines.push(`Size: ${profile.sizeBand.trim()} people`);
  if (profile.infrastructure?.length) lines.push(`Key IT infrastructure: ${profile.infrastructure.join(', ')}`);
  if (profile.securityTools?.length) lines.push(`Security tools in use: ${profile.securityTools.join(', ')}`);
  if (profile.crownJewels?.length) lines.push(`Highest-value assets (crown jewels): ${profile.crownJewels.join(', ')}`);
  if (profile.notes?.trim()) lines.push(`Notes: ${profile.notes.trim()}`);
  return lines.join('\n');
};

/**
 * AI-tailoring prompt: constrained editing of an existing good procedure,
 * not from-scratch generation. Structure preserved (SP 800-53A methods:
 * examine / interview / test), specifics re-aimed at the org's stack.
 */
export const buildTailorPrompt = (procedureMarkdown, profile) => `You are tailoring an existing NIST CSF 2.0 test procedure to a specific organization. Rewrite it so an auditor at THIS organization can follow it directly.

ORGANIZATION PROFILE:
${profileContext(profile)}

RULES:
- Keep the same structure and markdown formatting (headings, numbered steps, pass/fail criteria, evidence requests).
- Keep every test's intent; change examples, system names, and evidence sources to match the organization's stated infrastructure and tools.
- Reference the organization's crown jewels where data-protection steps apply.
- Do not invent findings or scores. Do not drop pass/fail criteria or interview questions.
- Output only the rewritten procedure markdown.

PROCEDURE TO TAILOR:
${procedureMarkdown}`;
