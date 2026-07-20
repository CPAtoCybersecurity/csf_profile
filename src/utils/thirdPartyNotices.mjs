/**
 * THIRD-PARTY-NOTICES.md — pure generation + validation logic.
 *
 * Shared (relatedSection.mjs precedent) between the build-time generator
 * (scripts/generate-third-party-notices.mjs) and the jest suite, so the CI
 * gate and the tests exercise the SAME code. The notices file is generated
 * from bank records — a hand-maintained notices file would be one more
 * per-surface re-derivation of license knowledge, the exact structure behind
 * the four historical share-export leaks.
 *
 * Deterministic by construction: banks and records render in sorted order,
 * notice text renders verbatim (reflowing a required notice is a derivative
 * of it), and nothing here reads the clock or the network — retrievedAt
 * values come from the records themselves.
 */

import { recordLicense, requiresAttribution, REFERENCE_ONLY } from './licenseClass.mjs';

/** noticeText key resolving to the canonical CISA no-endorsement form. */
export const CISA_NOTICE_KEY = 'cisa-no-endorsement';

/**
 * Scope statement (also stated in README and LICENSE): the MIT grant covers
 * the CODE. Generated data banks and vendored upstream content carry their
 * own licenses, recorded per record.
 */
export const SCOPE_STATEMENT =
  'The csf_profile source code is licensed under the MIT License (see LICENSE). ' +
  'Files under `src/data/` and `vendor/` carry their own licenses: generated ' +
  'data banks and vendored third-party content are governed by the per-record ' +
  'license metadata documented in this file, not by the MIT grant.';

/**
 * Standing MITRE notice. ATT&CK technique identifiers already appear in the
 * assessment catalog, and MITRE's Terms of Use condition reproduction on
 * carrying this notice — cheap insurance, so it stands unconditionally.
 */
export const MITRE_NOTICE =
  'This project references MITRE ATT&CK® technique identifiers. ATT&CK® is a ' +
  'registered trademark of The MITRE Corporation; © The MITRE Corporation. ' +
  'ATT&CK content is reproduced and distributed with the permission of The ' +
  'MITRE Corporation, per MITRE\'s Terms of Use. MITRE does not endorse this project.';

/**
 * CISA no-endorsement disclaimer. Emitted whenever any bundled record is
 * CISA-sourced — detected STRUCTURALLY from upstream provenance, not from a
 * hand-entered notice key, so forgetting the key cannot silently omit a
 * required notice (the key remains honored as a belt-and-braces trigger).
 * Wording reconciled (PR-3) against the disclaimer the vendored baselines
 * themselves carry: their standard form provides the material "as is" for
 * informational purposes only and disclaims endorsement of any commercial
 * product or service — both clauses are reflected below.
 */
export const CISA_DISCLAIMER =
  'Portions of this project are derived from the CISA Secure Configuration ' +
  'Baselines (SCuBA), released under CC0 1.0 Universal. Per the disclaimer ' +
  'those baselines carry, the material is provided "as is" for informational ' +
  'purposes only. CISA and the United States Government do not endorse this ' +
  'project, its authors, or any commercial product or service, and no such ' +
  'endorsement may be inferred. CC0 1.0 does not waive trademark rights: no ' +
  'CISA or DHS marks, seals, or logos are used by this project.';

/** Structural CISA provenance: the record's upstream repo is a cisagov one. */
export const isCisaSourced = (record) =>
  /^cisagov\//i.test(record?.attribution?.upstream?.repo || '');

/**
 * Validate every bank record against its license obligations. Returns error
 * strings; any error fails the build (the CI gate). Two rules:
 *  - an attribution-obligated record must carry a COMPLETE attribution block
 *    (attributionText, sourceUrl, licenseUrl, retrievedAt, upstream sha —
 *    each individually load-bearing);
 *  - a reference-only record must not be bundled in a bank at all (IDs and
 *    links only is the whole meaning of the class).
 * Banks: [{ name, records: { id: record } }].
 */
export const validateLicensedRecords = (banks) => {
  const errors = [];
  for (const bank of [...banks].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
    const ids = Object.keys(bank.records || {}).sort();
    for (const id of ids) {
      const record = bank.records[id];
      const { licenseClass } = recordLicense(record);
      if (licenseClass === REFERENCE_ONLY) {
        errors.push(
          `${bank.name} / ${id}: reference-only license ("${record.license}") — ` +
          'this content must not be bundled; link and control IDs only.'
        );
        continue;
      }
      if (requiresAttribution(record)) {
        const a = record.attribution || {};
        const missing = [
          ['attributionText', a.attributionText],
          ['sourceUrl', a.sourceUrl],
          ['licenseUrl', a.licenseUrl],
          ['retrievedAt', a.retrievedAt],
          ['upstream.sha', a.upstream?.sha]
        ].filter(([, v]) => !(typeof v === 'string' && v.trim()));
        for (const [field] of missing) {
          errors.push(
            `${bank.name} / ${id}: attribution-obligated record is missing "${field}" — ` +
            'incomplete attribution cannot ship.'
          );
        }
      }
    }
  }
  return errors;
};

const licensedRecordEntries = (bank) =>
  Object.entries(bank.records || {})
    .filter(([, record]) => record.license || record.licenseClass || record.licenseObligations)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));

/**
 * Render THIRD-PARTY-NOTICES.md. Call validateLicensedRecords first — this
 * renders whatever it is given. Notice text renders VERBATIM.
 */
export const renderNotices = (banks) => {
  const sorted = [...banks].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  const allLicensed = sorted.flatMap((bank) => licensedRecordEntries(bank).map(([, r]) => r));
  const cisaPresent = allLicensed.some(
    (r) => isCisaSourced(r) || recordLicense(r).obligations.noticeText.includes(CISA_NOTICE_KEY)
  );

  const lines = [
    '# Third-Party Notices',
    '',
    '<!-- GENERATED FILE — do not edit by hand. -->',
    '<!-- Regenerate: node scripts/generate-third-party-notices.mjs -->',
    '',
    '## License scope',
    '',
    SCOPE_STATEMENT,
    '',
    '## Standing notices',
    '',
    '### MITRE ATT&CK®',
    '',
    MITRE_NOTICE,
    ''
  ];

  if (cisaPresent) {
    lines.push('### CISA', '', CISA_DISCLAIMER, '');
  }

  lines.push('## Bundled third-party content', '');
  for (const bank of sorted) {
    lines.push(`### ${bank.name}`, '');
    const licensed = licensedRecordEntries(bank);
    if (licensed.length === 0) {
      lines.push('This bank currently contains no third-party licensed content.', '');
      continue;
    }
    for (const [id, record] of licensed) {
      const { obligations } = recordLicense(record);
      const a = record.attribution || {};
      lines.push(`#### ${id}`, '');
      if (record.license) lines.push(`- License: ${record.license}`);
      if (a.attributionText) lines.push(`- Attribution: ${a.attributionText}`);
      if (a.sourceUrl) lines.push(`- Source: ${a.sourceUrl}`);
      if (a.licenseUrl) lines.push(`- License text: ${a.licenseUrl}`);
      if (a.upstream?.repo) {
        lines.push(`- Upstream: ${a.upstream.repo}${a.upstream.sha ? `@${a.upstream.sha}` : ''}${a.upstream.path ? ` (${a.upstream.path})` : ''}`);
      }
      if (a.retrievedAt) lines.push(`- Retrieved: ${a.retrievedAt}`);
      if (obligations.noDerivatives) lines.push('- No-derivatives: this content is included verbatim and must remain verbatim.');
      const literalNotices = obligations.noticeText.filter((n) => n !== CISA_NOTICE_KEY);
      for (const notice of literalNotices) {
        lines.push('', `> ${notice}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
};
