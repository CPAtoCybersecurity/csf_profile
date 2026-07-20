/**
 * CISA SCuBA secure-configuration-baseline parser — turns vendored baseline
 * markdown (vendor/scuba/) into platform-procedure bank records.
 *
 * Lives in src/utils (not scripts/lib) because CRA jest only collects from
 * src/ — relatedSection.mjs precedent. Shared between the build-time
 * generator (scripts/generate-platform-bank.mjs) and the jest suite, so the
 * CI drift gate and the tests exercise the SAME code.
 *
 * Two upstream dialects, one parser (plan §5 C4):
 *  - policy IDs carry a version suffix: GWS.COMMONCONTROLS.1.1v1 /
 *    MS.AAD.1.1v1 — both forms parsed;
 *  - ScubaGoggles writes the MITRE mapping line WITHOUT underscores
 *    ("- MITRE ATT&CK TTP Mapping"), ScubaGear WITH
 *    ("- _MITRE ATT&CK TTP Mapping:_") — both forms parsed.
 * Field bullets additionally vary in punctuation across the corpus
 * (measured at the pinned SHAs): `_Rationale:_` vs `_Rationale_:`,
 * `_Last modified:_` vs `_Last Modified:_`, single vs double space after
 * the dash, and instruction headings with double spaces or trailing colons.
 * The regexes below tolerate every measured form; the manifest census
 * cross-check in the generator catches any form they miss.
 *
 * License comes from PER-FILE detection, never the repo-level label (plan §7
 * R-1): every ScubaGear M365 baseline carries an in-file "License Compliance
 * and Copyright" section declaring portions adapted from Microsoft docs under
 * CC BY 4.0 — those files stamp attribution-class metadata (raw license
 * string + component obligations + a complete attribution block). Files
 * without such a section stamp raw CC0-1.0. Records carry the RAW string and
 * declared obligation COMPONENTS only — never the computed classification
 * join, which recordLicense() derives at read (PR-3 entry condition 2).
 *
 * ScubaGear's "### License Requirements" sections are Microsoft PRODUCT
 * licensing ("requires Entra ID P2"), not content licensing — parsed into
 * productLicenseNotes, which must never wire into any share-export or render
 * block (reserved name, see licenseClass.mjs).
 */

export const PARSER_VERSION = 1;

/** noticeText key for the CISA no-endorsement disclaimer (thirdPartyNotices). */
const CISA_NOTICE_KEY = 'cisa-no-endorsement';

/** A `#### GWS.X.n.mvK` / `#### MS.X.n.mvK` policy heading (trimmed line). */
export const POLICY_HEADING = /^####\s+((?:GWS|MS)\.[A-Z0-9]+\.\d+\.\d+v\d+)$/;

const GROUP_HEADING = /^## (\d+)\. (.+)$/;
const INSTRUCTIONS_HEADING = /^####\s+((?:GWS|MS)\.[A-Z0-9]+\.\d+\.\d+v\d+)\s+Instructions:?$/;
/**
 * Group-common instruction headings, in every measured upstream spelling:
 * "Policy Group 9 Instructions", "Policy Group 2 common Instructions",
 * "Policy 1 Common Instructions", "Policy Group 1 Common Implementation:",
 * "GWS COMMONCONTROLS 18 Common Instructions".
 */
const GROUP_INSTRUCTIONS_HEADING =
  /^####\s+(?:Policy(?:\s+Group)?|GWS\s+[A-Z0-9]+)\s+(\d+)\s+(?:[Cc]ommon\s+)?(?:Instructions|Implementation):?$/;
const MITRE_LINE = /^-\s+_?MITRE ATT&CK TTP Mapping:?_?$/;
const NIST_LINE = /^-\s+_NIST SP 800-53 Rev\. 5 FedRAMP High Baseline Mapping_?:_?\s*(.+)$/;
const RATIONALE_LINE = /^-\s+_Rationale_?:_?\s*(.*)$/;
const LAST_MODIFIED_LINE = /^-\s+_Last [Mm]odified_?:_?\s*(.+)$/;
const NOTE_LINE = /^-\s+_Note_?:_?\s*(.*)$/;
const BADGE_LINE = /^\[!\[/;
const MITRE_TECHNIQUE_URL = /attack\.mitre\.org\/techniques\/(T\d+)(?:\/(\d+))?/g;

/**
 * Normalize baseline markdown into a fixpoint of the app's DOMPurify-based
 * input sanitizer, so attaching platform text is byte-lossless. Measured
 * sanitizer behavior (ALLOWED_TAGS: []): bare `&` and `>` pass through
 * untouched (blockquotes and "ATT&CK" are safe); every `<` is hostile —
 * letter-initial `<token>` sequences are DELETED outright (the class that
 * already ate `<email>` lines from 9 community entries), known tags are
 * stripped, comments are deleted, and any other `<` is entity-encoded.
 * The contract test asserts sanitizeInput(field) === field per record —
 * a REAL round-trip, not the community bank's proxy regex.
 */
export const normalizeScubaMarkdown = (markdown) => {
  let text = markdown
    // HTML comments are upstream build metadata (e.g. <!--Policy: ...-->),
    // deleted by the sanitizer — strip them at generation instead.
    .replace(/<!--[\s\S]*?-->/g, '')
    // The serializer would entity-encode a non-breaking space.
    .replace(/ /g, ' ')
    .replace(/\r\n/g, '\n');

  // <pre> blocks (ScubaGear console click-paths) become fenced code blocks;
  // inline emphasis tags inside them are dropped (markdown emphasis would
  // render literally inside a fence).
  text = text.replace(/<pre>([\s\S]*?)<\/pre>/gi, (whole, inner) => {
    const cleaned = inner
      .replace(/<\/?(?:b|strong|i|em)>/gi, '')
      .replace(/^\n+|\n+$/g, '');
    return '```\n' + cleaned + '\n```';
  });

  return (
    text
      // Inline emphasis outside fences becomes markdown emphasis.
      .replace(/<\/?(?:b|strong)>/gi, '**')
      .replace(/<\/?(?:i|em)>/gi, '*')
      .replace(/<code>([^<]*)<\/code>/gi, '`$1`')
      .replace(/<br\s*\/?>/gi, '\n')
      // Named anchors and images are GitHub-render furniture the app cannot
      // resolve (relative image paths, in-page anchor targets) — dropped.
      .replace(/<\/?a(?:\s[^<>]*)?>/gi, '')
      .replace(/<img\s[^<>]*>/gi, '')
      // Autolinks and emails lose their brackets (community-bank rules).
      .replace(/<(https?:\/\/[^<>\s]+)>/g, '$1')
      .replace(/<([^<>\s]+@[^<>\s]+)>/g, '$1')
      // Remaining letter-initial tokens are placeholders (<domain>,
      // <tenant-id>) the sanitizer would DELETE — carry them as inline code.
      .replace(/<([a-zA-Z][^<>]*)>/g, '`$1`')
      // Any `<` still standing (numeric comparisons like "<4") would be
      // entity-encoded on attach; store the encoded fixpoint form.
      .replace(/</g, '&lt;')
      .replace(/[ \t]+$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
};

/**
 * Per-file license detection (plan §7 R-1). The vendoring manifest's
 * per-source licenseId (the repo-grain license, positively recorded at
 * vendoring time) is the FLOOR; the file content — an in-file "License
 * Compliance and Copyright" section declaring CC BY portions — can only
 * TIGHTEN it, mirroring the licenseClass floor/ceiling model. CC0 is never
 * inferred from the mere absence of a CC BY marker, and which repo a file
 * came from never decides its class. The license string is a machine-
 * parseable SPDX expression (advisor adoption: `AND`, both licenses apply
 * to different portions — a composed prose phrase is a derivation wearing
 * a raw label); the human explanation lives in attributionText, and the
 * computed class is derived at read by recordLicense().
 */
export const detectFileLicense = (text, repoLicenseId) => {
  const floor = repoLicenseId || 'CC0-1.0';
  const licenseSection = extractSection(text, /^## License Compliance and Copyright\s*$/);
  const hasCcByPortions =
    licenseSection !== null && /Creative Commons Attribution 4\.0/i.test(licenseSection);
  const hasCisaDisclaimer = /CISA does not endorse/i.test(text);

  const noticeText = hasCisaDisclaimer ? [CISA_NOTICE_KEY] : [];

  if (hasCcByPortions) {
    return {
      license: `${floor} AND CC-BY-4.0`,
      licenseObligations: { attribution: true, changeIndication: true, noticeText },
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      attributionText:
        'Portions adapted from Microsoft M365 and Azure documentation (© Microsoft), ' +
        'used under the Creative Commons Attribution 4.0 International license, via ' +
        'the CISA ScubaGear Secure Configuration Baselines. Text has been modified ' +
        'from the original (normalized formatting; see the vendored source for the ' +
        'verbatim upstream form).'
    };
  }
  return {
    license: floor,
    licenseObligations: { noticeText },
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    attributionText:
      'Derived from the CISA Secure Configuration Baselines (SCuBA), released ' +
      'under CC0 1.0 Universal.'
  };
};

/** Text of the section opened by headingRe up to the next same-level heading. */
const extractSection = (text, headingRe) => {
  const lines = text.split('\n');
  const start = lines.findIndex((l) => headingRe.test(l.trim()));
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) { end = i; break; }
  }
  return lines.slice(start + 1, end).join('\n').trim();
};

const extractObligation = (assertion) => {
  const m = assertion.match(/\b(SHALL NOT|SHOULD NOT|SHALL|SHOULD|MAY)\b/);
  return m ? m[1] : '';
};

/**
 * Segment a policy block (the lines after its #### heading, up to the next
 * heading) into assertion + structured fields + leftover details. Bullet
 * grammar: a top-level `- ` line opens a segment; indented or blank lines
 * continue it. Everything that is not a recognized field bullet, badge, or
 * comment lands in `details` — nothing is silently dropped.
 */
const parsePolicyBlock = (block) => {
  const out = {
    assertion: '', rationale: '', lastModified: '', note: '',
    nist80053: [], mitreAttack: [], details: ''
  };

  let cursor = 0;
  while (cursor < block.length && block[cursor].trim() === '') cursor++;
  const assertionLines = [];
  while (cursor < block.length) {
    const line = block[cursor].trim();
    if (line === '' || BADGE_LINE.test(line) || /^<!--/.test(line) || /^-\s/.test(line)) break;
    assertionLines.push(line);
    cursor++;
  }
  out.assertion = normalizeScubaMarkdown(assertionLines.join(' '));

  // Segment the remainder into top-level bullets (with their continuation
  // lines) and non-bullet prose.
  const segments = [];
  let current = null;
  for (let i = cursor; i < block.length; i++) {
    const raw = block[i];
    const trimmed = raw.trim();
    if (/^-\s/.test(trimmed) && !/^\s/.test(raw)) {
      current = { head: trimmed, lines: [raw] };
      segments.push(current);
    } else if (current && (trimmed === '' || /^\s/.test(raw))) {
      current.lines.push(raw);
    } else {
      if (trimmed !== '') segments.push({ head: null, lines: [raw] });
      current = null;
    }
  }

  const detailParts = [];
  const noteParts = [];
  for (const seg of segments) {
    const head = seg.head;
    if (head === null) {
      const text = seg.lines.join('\n');
      if (!BADGE_LINE.test(text.trim()) && !/^<!--/.test(text.trim())) detailParts.push(text);
      continue;
    }
    const rationale = head.match(RATIONALE_LINE);
    if (rationale) {
      out.rationale = normalizeScubaMarkdown(
        [rationale[1], ...seg.lines.slice(1).map((l) => l.trim())].join(' ').trim()
      );
      continue;
    }
    const lastModified = head.match(LAST_MODIFIED_LINE);
    if (lastModified) { out.lastModified = lastModified[1].trim(); continue; }
    const nist = head.match(NIST_LINE);
    if (nist) {
      // Continuation lines scan like MITRE's: a future upstream wrap of the
      // control list must not silently drop the wrapped controls.
      out.nist80053 = [nist[1], ...seg.lines.slice(1).map((l) => l.trim())]
        .join(' ')
        .split(/,\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }
    if (MITRE_LINE.test(head)) {
      const seen = new Set();
      for (const line of seg.lines) {
        for (const m of line.matchAll(MITRE_TECHNIQUE_URL)) {
          // GWS writes sub-techniques T1110:001, ScubaGear T1110.001 — the
          // URL path (T1110/001) is dialect-free; normalize to the dot form.
          const id = m[2] ? `${m[1]}.${m[2]}` : m[1];
          if (!seen.has(id)) { seen.add(id); out.mitreAttack.push(id); }
        }
      }
      continue;
    }
    const note = head.match(NOTE_LINE);
    if (note) {
      noteParts.push(
        normalizeScubaMarkdown([note[1], ...seg.lines.slice(1).map((l) => l.trim())].join(' ').trim())
      );
      continue;
    }
    // Unrecognized bullet (e.g. aad.md's "Additional mitigations ..." advisory)
    // — preserved in details rather than silently dropped.
    detailParts.push(seg.lines.join('\n'));
  }

  out.note = noteParts.join('\n\n');
  out.details = normalizeScubaMarkdown(detailParts.join('\n'));
  return out;
};

/**
 * Parse one vendored baseline file into policy records.
 * source: { platformId, repo, sha, baselinesPath, retrievedAt, fileName,
 *           sourcePath, licenseId }
 */
export const parseBaselineFile = (text, source) => {
  const fileLicense = detectFileLicense(text, source.licenseId);
  const lines = text.replace(/\r\n/g, '\n').split('\n');

  const headingEnd = (start) => {
    for (let j = start + 1; j < lines.length; j++) {
      if (/^#### /.test(lines[j]) || /^###? /.test(lines[j])) return j;
    }
    return lines.length;
  };

  // Pass 1 — instruction blocks (per-policy and group-common) and per-group
  // product-license notes, all keyed before the policy walk so position in
  // the file doesn't matter.
  const instructions = {};
  const groupInstructions = new Map();
  const groupProductNotes = new Map();
  let walkGroup = 0;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    const g = trimmed.match(GROUP_HEADING);
    if (g) { walkGroup = Number(g[1]); continue; }
    const per = trimmed.match(INSTRUCTIONS_HEADING);
    if (per) {
      instructions[per[1]] = normalizeScubaMarkdown(lines.slice(i + 1, headingEnd(i)).join('\n'));
      continue;
    }
    const common = trimmed.match(GROUP_INSTRUCTIONS_HEADING);
    if (common) {
      groupInstructions.set(Number(common[1]), normalizeScubaMarkdown(lines.slice(i + 1, headingEnd(i)).join('\n')));
      continue;
    }
    if (/^### License Requirements$/.test(trimmed)) {
      const note = normalizeScubaMarkdown(lines.slice(i + 1, headingEnd(i)).join('\n'));
      if (note) groupProductNotes.set(walkGroup, note);
    }
  }

  // Pass 2 — policy blocks.
  const records = [];
  let group = '';
  let groupNumber = 0;
  for (let i = 0; i < lines.length; i++) {
    const g = lines[i].trim().match(GROUP_HEADING);
    if (g) {
      groupNumber = Number(g[1]);
      group = g[2].trim();
      continue;
    }
    const p = lines[i].trim().match(POLICY_HEADING);
    if (!p) continue;

    const policyId = p[1];
    const parsed = parsePolicyBlock(lines.slice(i + 1, headingEnd(i)));

    const record = {
      id: policyId.toLowerCase(),
      platform: source.platformId,
      policyId,
      group,
      groupNumber,
      assertion: parsed.assertion,
      obligation: extractObligation(parsed.assertion),
      rationale: parsed.rationale,
      lastModified: parsed.lastModified,
      nist80053: parsed.nist80053,
      mitreAttack: parsed.mitreAttack
    };
    if (parsed.note) record.note = parsed.note;
    if (parsed.details) record.details = parsed.details;
    const productNote = groupProductNotes.get(groupNumber);
    if (productNote) record.productLicenseNotes = productNote;
    // Per-policy instructions win; a group-common block ("Policy Group 9
    // Instructions") is the fallback for policies without their own.
    const policyInstructions = instructions[policyId] || groupInstructions.get(groupNumber);
    if (policyInstructions) record.instructions = policyInstructions;

    record.license = fileLicense.license;
    record.licenseObligations = fileLicense.licenseObligations;
    record.attribution = {
      attributionText: fileLicense.attributionText,
      sourceUrl: `https://github.com/${source.repo}/blob/${source.sha}/${source.baselinesPath}/${source.fileName}`,
      licenseUrl: fileLicense.licenseUrl,
      retrievedAt: source.retrievedAt,
      upstream: {
        repo: source.repo,
        sha: source.sha,
        path: `${source.baselinesPath}/${source.fileName}`
      }
    };
    record.sourcePath = source.sourcePath;

    records.push(record);
  }

  return records;
};
