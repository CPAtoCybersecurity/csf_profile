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

export { REPO_MAIN_LINK };
