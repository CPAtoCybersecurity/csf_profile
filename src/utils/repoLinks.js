/**
 * Static integrity checking for links that point back into this repository.
 *
 * Directory restructures (see commit 94234c8, which moved assessment materials into
 * ASSESSMENT_CATALOG/) silently orphan every hardcoded github.com URL that referenced the old
 * path. The failure is invisible until someone clicks and lands on a 404, so it is checked here
 * and enforced by repoLinks.test.js.
 *
 * Only `main`-branch URLs are checked. Commit-pinned URLs (/commit/<sha>, /blob/<sha>) stay
 * valid forever and are ignored, as are links to branches on other people's forks.
 */

const THIS_REPO = 'CPAtoCybersecurity/csf_profile';

// Forks that are legitimately linked from contributed content. A main-branch link to anything
// outside this set is treated as a mistyped reference rather than silently skipped.
const KNOWN_REPOS = new Set([THIS_REPO, 'greetingsog/csf_profile']);

// A file containing this marker is skipped by the sweep. Used by this module's own tests, which
// necessarily contain deliberately-broken sample URLs.
export const IGNORE_MARKER = 'repo-link-guard:ignore-file';

// Extensions worth reading as text. Everything else in the tree is an image or an Office
// document and cannot contain a source-level URL reference.
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.md', '.mdx',
  '.csv', '.yml', '.yaml', '.html', '.css', '.txt', '.sh', '.rs', '.toml'
]);

// Characters that terminate a URL rather than belong to it. Commas matter most: these links are
// embedded in CSV exports, where the next column would otherwise be swallowed into the path.
const URL_TERMINATORS = '\\s"\'`)\\]<>,';

function linkPattern(repo) {
  const escaped = repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `https://github\\.com/${escaped}/(?:blob|tree)/main/([^${URL_TERMINATORS}]+)`,
    'g'
  );
}

function anyRepoPattern() {
  return new RegExp(
    `https://github\\.com/([\\w.-]+)/([\\w.-]+)/(?:blob|tree)/main/[^${URL_TERMINATORS}]+`,
    'g'
  );
}

/**
 * Reduce the raw tail of a matched URL to the repository path it refers to.
 *
 * Trailing punctuation is trimmed because URLs are commonly written inside prose or markdown
 * autolinks; `#fragment` and `?query` are dropped because they address a location within a file
 * rather than a different file; a trailing escape sequence is dropped because URLs are commonly
 * embedded in JavaScript string literals inside this repo's generated data files.
 *
 * @param {string} raw the captured path portion of a URL
 * @returns {string|null} a repo-relative path, or null if nothing usable remains
 */
export function normalizeLinkPath(raw) {
  const trimmed = raw
    .split(/[#?]/)[0]
    .replace(/\\[nrt].*$/, '')
    .replace(/[.,;:>]+$/, '')
    .replace(/\/+$/, '');
  if (!trimmed) return null;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    // A literal `%` that is not valid percent-encoding. Report the path as written rather than
    // throwing, so the failure surfaces as a named broken link instead of a crashed test run.
    return trimmed;
  }
}

/**
 * Extract repo-relative paths from every main-branch URL for this repo in a blob of text.
 *
 * URLs containing a `${` are template literals assembled at runtime and cannot be resolved
 * statically, so they are skipped. Their inputs are validated separately — the one such link,
 * in procedureBank.js, is built from communityProcedures.json, which CI regenerates from
 * ASSESSMENT_CATALOG and fails on drift.
 *
 * @param {string} text source file contents
 * @returns {string[]} repo-relative paths, in order of appearance
 */
export function extractRepoLinkPaths(text) {
  const paths = [];
  for (const match of text.matchAll(linkPattern(THIS_REPO))) {
    if (match[1].includes('${')) continue;
    const normalized = normalizeLinkPath(match[1]);
    if (normalized) paths.push(normalized);
  }
  return paths;
}

/**
 * Find links that look like a misspelled reference to this repository.
 *
 * Linking to another project's main branch is ordinary and is left alone. A link is suspect when
 * exactly one half of the slug matches ours: the right repo name under an unrecognised owner
 * (`CPAtoCyberSecurity/csf_profile`), or our owner with a mangled repo name
 * (`CPAtoCybersecurity/csf-profile`). Both would otherwise pass silently — neither matches the
 * exact-slug pattern the path check uses, so nothing else in this module would see them.
 *
 * @param {string} text source file contents
 * @returns {string[]} the suspect `owner/repo` slugs found
 */
export function findUnknownRepos(text) {
  const [ourOwner, ourRepo] = THIS_REPO.split('/');
  const unknown = [];

  for (const match of text.matchAll(anyRepoPattern())) {
    const [, owner, repo] = match;
    const slug = `${owner}/${repo}`;
    if (KNOWN_REPOS.has(slug)) continue;

    const ownerMatches = owner.toLowerCase() === ourOwner.toLowerCase();
    const repoMatches = repo.toLowerCase() === ourRepo.toLowerCase();
    // Neither half matches: an unrelated project, which is none of this guard's business.
    if (!ownerMatches && !repoMatches) continue;

    unknown.push(slug);
  }

  return unknown;
}

/** @returns {boolean} whether this file's contents should be swept. */
export function isScannable(relPath, contents) {
  // Basename first: a dotted directory such as `.github/CODEOWNERS` would otherwise yield an
  // "extension" of `.github/codeowners`.
  const name = relPath.slice(relPath.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  const ext = dot <= 0 ? '' : name.slice(dot).toLowerCase();
  return TEXT_EXTENSIONS.has(ext) && !contents.includes(IGNORE_MARKER);
}

/**
 * Sweep a set of files for main-branch links that do not resolve.
 *
 * Kept separate from the test so the failure path itself can be exercised against a fixture —
 * a sweep whose broken-link branch is never executed is a sweep that can silently invert.
 *
 * @param {Array<{path: string, contents: string}>} files
 * @param {(relPath: string) => boolean} resolves predicate answering "is this path on main?"
 * @returns {{broken: string[], checked: number}}
 */
export function sweepLinks(files, resolves) {
  const broken = [];
  let checked = 0;

  for (const file of files) {
    if (!isScannable(file.path, file.contents)) continue;
    for (const rel of extractRepoLinkPaths(file.contents)) {
      checked += 1;
      if (!resolves(rel)) {
        broken.push(
          `${file.path} links to "${rel}", which is not a tracked path on main. Update the URL ` +
            'to the current location of the file, or pin it to a commit (/commit/<sha>) if it ' +
            'is meant to reference a historical version.'
        );
      }
    }
  }

  return { broken, checked };
}

export { THIS_REPO };
