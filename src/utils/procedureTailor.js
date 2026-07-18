/**
 * Tailoring of community test procedures to an organization profile.
 *
 * Two tiers:
 *  - Deterministic (no AI): substitute the org's name for the fictional
 *    "Alma Security" the catalog is written against.
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

/** Deterministic substitution. Returns { text, tailored }. */
export const tailorMarkdown = (markdown, profile) => {
  const orgName = profile?.orgName?.trim();
  if (!orgName || !markdown) return { text: markdown, tailored: false };
  const text = markdown
    .replace(/Alma Security/g, orgName)
    .replace(/\bAlma's\b/g, `${orgName}'s`)
    .replace(/\bAlma\b/g, orgName);
  return { text, tailored: text !== markdown };
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
