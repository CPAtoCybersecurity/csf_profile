import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { extractRepoLinkPaths, findUnknownRepoOwners } from './repoLinks';

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'src');

/**
 * Every path git tracks, as an exact-case set.
 *
 * `fs.existsSync` is the wrong check on two counts: macOS filesystems are case-insensitive, so
 * `ASSESSMENT_Catalog/x.md` resolves locally and 404s on github.com; and a file that exists in
 * the working tree but is untracked or gitignored is not on `main` either. Reading the index
 * answers both. Returns null when git is unavailable, in which case the sweep falls back to
 * checking existence only.
 */
function trackedPaths() {
  try {
    const out = execFileSync('git', ['-C', ROOT, 'ls-files', '-z'], { encoding: 'utf8' });
    return new Set(out.split('\0').filter(Boolean));
  } catch {
    return null;
  }
}

function isOnMain(rel, tracked) {
  if (!tracked) return fs.existsSync(path.join(ROOT, rel));
  // Directories are not themselves index entries; they exist if they contain a tracked file.
  return tracked.has(rel) || [...tracked].some(p => p.startsWith(`${rel}/`));
}

// This file necessarily contains malformed sample URLs as test fixtures, so it excludes itself
// from the on-disk sweep. Its own extraction behavior is covered by the unit tests below.
const SELF = path.join(SRC, 'utils', 'repoLinks.test.js');

function sourceFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, out);
    else if (full !== SELF) out.push(full);
  }
  return out;
}

describe('extractRepoLinkPaths', () => {
  test('extracts the path from a blob URL', () => {
    const text = 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/README.md';
    expect(extractRepoLinkPaths(text)).toEqual(['README.md']);
  });

  test('extracts the path from a tree URL', () => {
    const text = 'https://github.com/CPAtoCybersecurity/csf_profile/tree/main/ASSESSMENT_CATALOG';
    expect(extractRepoLinkPaths(text)).toEqual(['ASSESSMENT_CATALOG']);
  });

  test('percent-decodes paths so %20 matches a real space', () => {
    const text = 'https://github.com/CPAtoCybersecurity/csf_profile/tree/main/A%20B/c.md';
    expect(extractRepoLinkPaths(text)).toEqual(['A B/c.md']);
  });

  test('ignores commit-pinned URLs, which never rot', () => {
    const text =
      'https://github.com/CPAtoCybersecurity/csf_profile/commit/0977939cf00b964fdca5aa9339c24c6d12c23c56';
    expect(extractRepoLinkPaths(text)).toEqual([]);
  });

  test('ignores links to other forks of this repo', () => {
    const text =
      'https://github.com/greetingsog/csf_profile/blob/greetingsog-patch-1/Sample_Artifacts/x.md';
    expect(extractRepoLinkPaths(text)).toEqual([]);
  });

  test('skips template literals, which cannot be resolved statically', () => {
    // The interpolation marker is the fixture here, not a mistake — hence the rule opt-out.
    // eslint-disable-next-line no-template-curly-in-string
    const text = 'https://github.com/CPAtoCybersecurity/csf_profile/blob/main/${entry.sourcePath}';
    expect(extractRepoLinkPaths(text)).toEqual([]);
  });

  test('trims trailing punctuation from URLs written inside prose', () => {
    const text =
      'see https://github.com/CPAtoCybersecurity/csf_profile/blob/main/README.md, and elsewhere';
    expect(extractRepoLinkPaths(text)).toEqual(['README.md']);
  });
});

describe('repo link integrity', () => {
  const files = sourceFiles(SRC);

  test('the sweep actually finds source files to scan', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  test('every main-branch repo link under src/ points at a path that is on main', () => {
    const tracked = trackedPaths();
    const broken = [];
    let checked = 0;

    for (const file of files) {
      for (const rel of extractRepoLinkPaths(fs.readFileSync(file, 'utf8'))) {
        checked += 1;
        if (!isOnMain(rel, tracked)) {
          broken.push(
            `${path.relative(ROOT, file)} links to "${rel}", which is not a tracked path. ` +
              'Update the URL to the file\'s current location, or pin it to a commit ' +
              '(/commit/<sha>) if it is meant to reference a historical version.'
          );
        }
      }
    }

    // Guards against the check silently passing because the regex stopped matching anything.
    expect(checked).toBeGreaterThan(0);
    expect(broken).toEqual([]);
  });

  test('every main-branch link belongs to this repo or a known fork', () => {
    const unknown = [];
    for (const file of files) {
      for (const slug of findUnknownRepoOwners(fs.readFileSync(file, 'utf8'))) {
        unknown.push(`${path.relative(ROOT, file)} -> ${slug}`);
      }
    }
    expect(unknown).toEqual([]);
  });

  // Polarity proof: the sweep above is only meaningful if a bad path would actually fail it.
  test('a link to a nonexistent path is detected as broken', () => {
    const bogus =
      'https://github.com/CPAtoCybersecurity/csf_profile/tree/main/THIS_DIRECTORY_DOES_NOT_EXIST';
    const [rel] = extractRepoLinkPaths(bogus);
    expect(rel).toBe('THIS_DIRECTORY_DOES_NOT_EXIST');
    expect(isOnMain(rel, trackedPaths())).toBe(false);
  });

  // Polarity proof for the case check specifically: this path exists on a case-insensitive
  // filesystem, so only an index-backed comparison can reject it.
  test('a link whose casing differs from the tracked path is detected as broken', () => {
    const tracked = trackedPaths();
    if (!tracked) return; // git unavailable; the sweep already degraded to existence-only
    expect(isOnMain('ASSESSMENT_CATALOG', tracked)).toBe(true);
    expect(isOnMain('assessment_catalog', tracked)).toBe(false);
  });
});
