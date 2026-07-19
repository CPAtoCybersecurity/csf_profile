// repo-link-guard:ignore-file — this file contains deliberately-broken sample URLs as fixtures.
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import {
  extractRepoLinkPaths,
  findUnknownRepos,
  isScannable,
  normalizeLinkPath,
  sweepLinks
} from './repoLinks';

const ROOT = path.resolve(__dirname, '..', '..');

/**
 * Every path git tracks, as an exact-case set.
 *
 * `fs.existsSync` is the wrong check on two counts: macOS filesystems are case-insensitive, so
 * `ASSESSMENT_Catalog/x.md` resolves locally and 404s on github.com; and a file present in the
 * working tree but untracked or gitignored is not on `main` either. Reading the index answers
 * both, and it also gives the sweep its file list, which excludes node_modules and build/ for
 * free. Returns null when git is unavailable.
 */
function readIndex() {
  try {
    const out = execFileSync('git', ['-C', ROOT, 'ls-files', '-z'], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024
    });
    return out.split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

const INDEX = readIndex();
const TRACKED = INDEX && new Set(INDEX);

// Directories are not index entries of their own; one is on main if it contains a tracked file.
const TRACKED_DIRS =
  INDEX &&
  new Set(
    INDEX.flatMap(p => {
      const dirs = [];
      for (let i = p.indexOf('/'); i !== -1; i = p.indexOf('/', i + 1)) dirs.push(p.slice(0, i));
      return dirs;
    })
  );

function isOnMain(rel) {
  if (!TRACKED) return fs.existsSync(path.join(ROOT, rel));
  return TRACKED.has(rel) || TRACKED_DIRS.has(rel);
}

// A test that returns before asserting still reports green, so a missing git would silently
// downgrade this whole file to the weaker existence check with nothing in the output to say so.
// On CI that is a failure, not a degradation; locally it is announced.
const gitAvailable = INDEX !== null;
if (!gitAvailable && !process.env.CI) {
  console.warn(
    'repoLinks.test.js: git unavailable — link sweep degraded to existence-only, ' +
      'which cannot detect case drift or untracked paths.'
  );
}
const describeWithGit = gitAvailable || process.env.CI ? describe : describe.skip;

function loadTrackedFiles() {
  const list = INDEX || [];
  const files = [];
  for (const rel of list) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    // Cheap extension gate before reading, so binaries are never slurped.
    if (!isScannable(rel, '')) continue;
    files.push({ path: rel, contents: fs.readFileSync(full, 'utf8') });
  }
  return files;
}

describe('normalizeLinkPath', () => {
  test('drops a fragment, which addresses a location inside a file', () => {
    expect(normalizeLinkPath('README.md#install')).toBe('README.md');
  });

  test('drops a query string', () => {
    expect(normalizeLinkPath('README.md?raw=1')).toBe('README.md');
  });

  test('drops a markdown autolink terminator', () => {
    expect(normalizeLinkPath('README.md>')).toBe('README.md');
  });

  test('drops a trailing escape sequence from an embedded string literal', () => {
    expect(normalizeLinkPath('README.md\\n more prose')).toBe('README.md');
  });

  test('drops a trailing slash on a directory link', () => {
    expect(normalizeLinkPath('ASSESSMENT_CATALOG/')).toBe('ASSESSMENT_CATALOG');
  });

  test('percent-decodes so %20 matches a real space', () => {
    expect(normalizeLinkPath('A%20B/c.md')).toBe('A B/c.md');
  });

  test('returns a malformed percent-encoding as written instead of throwing', () => {
    expect(() => normalizeLinkPath('50%off.md')).not.toThrow();
    expect(normalizeLinkPath('50%off.md')).toBe('50%off.md');
  });

  test('returns null when nothing usable remains', () => {
    expect(normalizeLinkPath('#anchor-only')).toBeNull();
  });
});

describe('extractRepoLinkPaths', () => {
  test('extracts the path from a blob URL', () => {
    expect(
      extractRepoLinkPaths('https://github.com/CPAtoCybersecurity/csf_profile/blob/main/README.md')
    ).toEqual(['README.md']);
  });

  test('extracts the path from a tree URL', () => {
    expect(
      extractRepoLinkPaths(
        'https://github.com/CPAtoCybersecurity/csf_profile/tree/main/ASSESSMENT_CATALOG'
      )
    ).toEqual(['ASSESSMENT_CATALOG']);
  });

  test('ignores commit-pinned URLs, which never rot', () => {
    const text =
      'https://github.com/CPAtoCybersecurity/csf_profile/commit/0977939cf00b964fdca5aa9339c24c6d12c23c56';
    expect(extractRepoLinkPaths(text)).toEqual([]);
  });

  test('ignores branches on other forks of this repo', () => {
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

  test('finds several links in one blob of prose', () => {
    const text = [
      'see https://github.com/CPAtoCybersecurity/csf_profile/blob/main/README.md, and',
      '[here](https://github.com/CPAtoCybersecurity/csf_profile/tree/main/ASSESSMENT_CATALOG)'
    ].join('\n');
    expect(extractRepoLinkPaths(text)).toEqual(['README.md', 'ASSESSMENT_CATALOG']);
  });
});

describe('findUnknownRepos', () => {
  test('accepts this repo', () => {
    expect(
      findUnknownRepos('https://github.com/CPAtoCybersecurity/csf_profile/blob/main/README.md')
    ).toEqual([]);
  });

  test('flags a mistyped owner rather than treating it as another fork', () => {
    expect(
      findUnknownRepos('https://github.com/CPAtoCyberSecurity/csf_profile/blob/main/README.md')
    ).toEqual(['CPAtoCyberSecurity/csf_profile']);
  });

  test('flags a mangled repo name under the correct owner', () => {
    // Neither check would otherwise see this: the path pattern requires an exact slug, and a
    // repo-name-only rule would read `csf-profile` as somebody else's project.
    expect(
      findUnknownRepos('https://github.com/CPAtoCybersecurity/csf-profile/blob/main/README.md')
    ).toEqual(['CPAtoCybersecurity/csf-profile']);
  });

  test('leaves links to unrelated projects alone', () => {
    expect(findUnknownRepos('https://github.com/danielmiessler/Telos/blob/main/README.md')).toEqual(
      []
    );
  });

  test('leaves an unrelated project owned by someone else entirely alone', () => {
    expect(
      findUnknownRepos('https://github.com/facebook/create-react-app/blob/main/README.md')
    ).toEqual([]);
  });
});

describe('CSV embedding', () => {
  test('a link in a CSV cell stops at the column separator', () => {
    const row =
      'AR-3,https://github.com/CPAtoCybersecurity/csf_profile/blob/main/README.md,Sample case';
    expect(extractRepoLinkPaths(row)).toEqual(['README.md']);
  });
});

describe('isScannable', () => {
  test('accepts source and documentation files', () => {
    expect(isScannable('src/pages/Settings.js', '')).toBe(true);
    expect(isScannable('README.md', '')).toBe(true);
    expect(isScannable('GET_THE_SPREADSHEETS/JIRA-Artifacts.csv', '')).toBe(true);
  });

  test('rejects binaries, which cannot hold a source-level reference', () => {
    expect(isScannable('public/logo192.png', '')).toBe(false);
    expect(isScannable('ASSESSMENT_CATALOG/1_Case_Study/alma-backgrounder.docx', '')).toBe(false);
  });

  test('rejects a file that opts out via the marker', () => {
    expect(isScannable('src/utils/repoLinks.test.js', 'repo-link-guard:ignore-file')).toBe(false);
  });

  test('reads the extension from the basename, not a dotted directory', () => {
    expect(isScannable('.github/CODEOWNERS', '')).toBe(false);
    expect(isScannable('.github/workflows/ci.yml', '')).toBe(true);
  });

  test('rejects a dotfile with no extension of its own', () => {
    expect(isScannable('.gitignore', '')).toBe(false);
  });
});

describe('sweepLinks', () => {
  const linkTo = p => `https://github.com/CPAtoCybersecurity/csf_profile/blob/main/${p}`;

  // Polarity proof: the sweep is only meaningful if a dead path actually reaches `broken`.
  test('reports a link whose path does not resolve', () => {
    const files = [{ path: 'fixture.js', contents: linkTo('NO_SUCH_DIR/nope.md') }];
    const { broken, checked } = sweepLinks(files, () => false);
    expect(checked).toBe(1);
    expect(broken).toHaveLength(1);
    expect(broken[0]).toContain('fixture.js');
    expect(broken[0]).toContain('NO_SUCH_DIR/nope.md');
  });

  test('says nothing about a link whose path resolves', () => {
    const files = [{ path: 'fixture.js', contents: linkTo('README.md') }];
    expect(sweepLinks(files, () => true)).toEqual({ broken: [], checked: 1 });
  });

  test('skips files that opt out, including their broken links', () => {
    const files = [
      { path: 'fixture.js', contents: `repo-link-guard:ignore-file ${linkTo('NO_SUCH.md')}` }
    ];
    expect(sweepLinks(files, () => false)).toEqual({ broken: [], checked: 0 });
  });

  test('skips binaries without reading them for links', () => {
    const files = [{ path: 'thing.png', contents: linkTo('NO_SUCH.md') }];
    expect(sweepLinks(files, () => false)).toEqual({ broken: [], checked: 0 });
  });
});

describeWithGit('repo link integrity', () => {
  const files = loadTrackedFiles();

  // On CI this must hold outright: a checkout without a git index would otherwise turn every
  // assertion below into a vacuous pass.
  test('git is available, so the index-backed checks are real', () => {
    expect(gitAvailable).toBe(true);
  });

  test('the sweep has files to scan', () => {
    expect(files.length).toBeGreaterThan(100);
  });

  test('every main-branch link in the repo points at a path that is on main', () => {
    const { broken, checked } = sweepLinks(files, isOnMain);
    // Guards against a silent pass caused by the regex or the file walk going dark.
    expect(checked).toBeGreaterThan(0);
    expect(broken).toEqual([]);
  });

  test('no link misspells this repo as an unrecognised owner', () => {
    const unknown = [];
    for (const file of files) {
      if (!isScannable(file.path, file.contents)) continue;
      for (const slug of findUnknownRepos(file.contents)) {
        unknown.push(`${file.path} -> ${slug}`);
      }
    }
    expect(unknown).toEqual([]);
  });

  test('the index comparison is case-exact, which fs.existsSync is not on macOS', () => {
    expect(isOnMain('ASSESSMENT_CATALOG')).toBe(true);
    expect(isOnMain('assessment_catalog')).toBe(false);
  });

  test('a nested directory counts as on main when it holds a tracked file', () => {
    expect(isOnMain('ASSESSMENT_CATALOG/5_Artifacts/Tickets')).toBe(true);
    expect(isOnMain('ASSESSMENT_CATALOG/no_such_subdir')).toBe(false);
  });

  test('an untracked file present in the working tree does not count as on main', () => {
    expect(fs.existsSync(path.join(ROOT, 'node_modules'))).toBe(true);
    expect(isOnMain('node_modules')).toBe(false);
  });
});
