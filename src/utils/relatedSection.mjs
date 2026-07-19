/**
 * Community test-procedure markdown cleanup (issue #294), shared between the
 * bank generator (scripts/generate-procedure-bank.mjs, node) and the v14
 * assessments migration (src/stores/assessmentsStore.js, browser). Pure
 * string functions — no node or browser APIs — so both sides apply the
 * IDENTICAL transform: a pristine copy attached from an older bank, once
 * cleaned in place, is byte-identical to the freshly generated bank entry.
 */

const GITHUB_BLOB_BASE = 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/';

/**
 * Remove the "## Related" / "## Related Artifacts" section: heading through
 * the line before the next "## " heading (or end of text). Catalog files use
 * these sections for relative links that only resolve on GitHub — dead links
 * in the app, and every bullet duplicates a real app surface (artifact chips,
 * the Controls tab, the observations panel). Sections AFTER Related (e.g.
 * "## Notes") are preserved. Idempotent.
 */
export function stripRelatedSection(markdown) {
  const lines = markdown.split('\n');
  const start = lines.findIndex((l) => /^## Related\b/.test(l));
  if (start === -1) return markdown;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) { end = i; break; }
  }
  lines.splice(start, end - start);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Rewrite relative markdown links (e.g. ../../0_Methodology/x.md#anchor) to
 * absolute GitHub blob URLs so they keep working when rendered inside the
 * app. sourceDir is the repo-relative directory of the source file, e.g.
 * "ASSESSMENT_CATALOG/3_Test_Procedures/DE". Idempotent (absolute URLs are
 * left alone). Targets may contain spaces (catalog filenames do) — path
 * segments are percent-encoded on output.
 */
export function rewriteRelativeLinks(markdown, sourceDir) {
  return markdown.replace(/\]\((\.\.?\/[^)]+)\)/g, (whole, target) => {
    const [pathPart, anchor] = target.split('#');
    const segments = sourceDir.split('/').filter(Boolean);
    for (const seg of pathPart.split('/')) {
      if (seg === '' || seg === '.') continue;
      if (seg === '..') {
        if (!segments.length) return whole; // escapes the repo — leave untouched
        segments.pop();
      } else {
        segments.push(seg);
      }
    }
    const resolved = segments.map(encodeURIComponent).join('/');
    return `](${GITHUB_BLOB_BASE}${resolved}${anchor ? `#${anchor}` : ''})`;
  });
}

/** The full cleanup applied to every bank entry, in canonical order. */
export function cleanCommunityMarkdown(markdown, sourceDir) {
  return rewriteRelativeLinks(stripRelatedSection(markdown), sourceDir);
}
