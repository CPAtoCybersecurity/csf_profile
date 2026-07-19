/**
 * Static integrity checking for links that point back into this repository.
 *
 * Directory restructures (see commit 94234c8, which moved assessment materials into
 * ASSESSMENT_CATALOG/) silently orphan every hardcoded github.com URL that referenced the old
 * path. The failure is invisible until a user clicks and lands on a 404, so it is checked here
 * and enforced by repoLinks.test.js.
 *
 * Only `main`-branch URLs for this repo are checked. Commit-pinned URLs (/commit/<sha>,
 * /blob/<sha>) stay valid forever and are ignored, as are links to other people's forks.
 */

const REPO_MAIN_LINK =
  /https:\/\/github\.com\/CPAtoCybersecurity\/csf_profile\/(?:blob|tree)\/main\/([^\s"'`)\]]+)/g;

// Any repo's main-branch links, so a typo in the owner or repo name fails loudly instead of
// being silently classified as somebody else's fork and skipped.
const ANY_MAIN_LINK =
  /https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)\/(?:blob|tree)\/main\/[^\s"'`)\]]+/g;

// Forks that are legitimately linked from contributed content. Anything outside this set that
// links to a /main/ path is treated as a mistyped reference to this repository.
const KNOWN_OWNERS = new Set(['CPAtoCybersecurity/csf_profile', 'greetingsog/csf_profile']);

/**
 * Extract repo-relative paths from every main-branch repo URL in a blob of source text.
 *
 * Paths are percent-decoded so `%20` matches a real space on disk. Trailing punctuation is
 * trimmed because URLs are commonly written inside markdown links or prose. URLs containing a
 * `${` are template literals assembled at runtime and cannot be resolved statically, so they
 * are skipped — their inputs are validated separately (see communityProcedures.test.js).
 *
 * @param {string} text source file contents
 * @returns {string[]} repo-relative paths, in order of appearance
 */
export function extractRepoLinkPaths(text) {
  const paths = [];
  for (const match of text.matchAll(REPO_MAIN_LINK)) {
    const raw = match[1].replace(/[.,)]+$/, '');
    if (raw.includes('${')) continue;
    paths.push(decodeURIComponent(raw));
  }
  return paths;
}

/**
 * Find main-branch links whose owner/repo is neither this repo nor a known fork.
 *
 * @param {string} text source file contents
 * @returns {string[]} the unrecognised `owner/repo` slugs found
 */
export function findUnknownRepoOwners(text) {
  const unknown = [];
  for (const match of text.matchAll(ANY_MAIN_LINK)) {
    const slug = `${match[1]}/${match[2]}`;
    if (!KNOWN_OWNERS.has(slug)) unknown.push(slug);
  }
  return unknown;
}

export { REPO_MAIN_LINK, ANY_MAIN_LINK, KNOWN_OWNERS };
