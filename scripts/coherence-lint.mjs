#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const CONTENT_RULE_EXEMPTIONS = [
  'ASSESSMENT_CATALOG/0_Methodology/Alma-Fact-Sheet.md',
  'ASSESSMENT_CATALOG/0_Methodology/Instructor-Key.md',
  'ASSESSMENT_CATALOG/0_Methodology/Scoring-Rubric-and-Methodology.md',
];

const RULES = [
  {
    id: 'founded-2023',
    kind: 'content',
    regex: /[Ff]ounded (in )?2023/,
    message: 'Alma was founded in 2021, not 2023.',
  },
  {
    id: 'banned-stack',
    kind: 'content',
    regex: /\b(Splunk|CrowdStrike|Okta|Jira)\b/,
    message:
      "Splunk/CrowdStrike/Okta/Jira are NOT in Alma's stack (SIEM = AWS-native; EDR = SentinelOne; SSO/MFA = Windows Authenticator + Palo Alto; tickets = ServiceNow).",
  },
  {
    id: 'legacy-assessor',
    kind: 'content',
    regex: /Steve <steve@almasecurity\.com>/,
    message:
      'Legacy assessor identity; use Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>.',
  },
  {
    id: 'og-assessor',
    kind: 'content',
    regex: /\*\*Assessor:\*\* OG\b/,
    message: 'Legacy assessor placeholder "OG"; use Omar Garza, Internal Audit.',
  },
  {
    id: 'jane-doe',
    kind: 'content',
    regex: /Jane Doe/,
    message: 'Legacy placeholder "Jane Doe"; the QA reviewer is Dana Whitfield.',
  },
  {
    id: 'stale-assessment-name',
    kind: 'content',
    regex: /2025 Alma Security CSF/,
    message: 'Stale assessment name; canonical is "2026 Alma Security CSF Assessment".',
  },
  {
    id: 'stale-target-dates',
    kind: 'content',
    regex: /by (Jan(uary)?|Aug(ust)?) 2025\b/,
    message: 'Stale KPI target date; canonical targets are Jan 2027 / Aug 2027.',
  },
  {
    id: 'dead-branch-link',
    kind: 'content',
    regex: /feature\/api-integration/,
    message: 'Dead branch link; use relative links into 1_Case_Study/.',
  },
  {
    id: 'headcount-as-current',
    kind: 'content',
    regex: /~?120-person/,
    message: '120 is FY2023 headcount, not current; current headcount is 300.',
  },
  {
    id: 'band-mislabel',
    kind: 'content',
    // A line that also names the correct label is educational text (e.g. the
    // template's boundary-rule note), not a mislabel.
    matches: (line) =>
      (/\b5\.\d\b[^\n]{0,60}Some Security|Some Security[^\n]{0,60}\b5\.\d\b/.test(line)) &&
      !/Minimally Acceptable/.test(line),
    message: 'Score band mislabel; 5.0–5.9 is "Minimally Acceptable", not "Some Security".',
  },
  {
    id: 'grc-manager',
    kind: 'content',
    regex: /GRC Manager/,
    message:
      'The title "GRC Manager" is banned (collides with the assessor function); the canonical role is Security GRC Lead (Leila Haddad) — see Alma-Fact-Sheet.md SS3.',
  },
  {
    id: 'register-swap',
    kind: 'content',
    // Adjacency-based: flag "R2 = asset inventory" style pairings, not lines
    // that enumerate the whole canonical register (those legitimately contain
    // both tokens far apart or alongside the canonical R4/R5 pairing).
    matches: (line) => {
      const r2Swap = /\bR2\b[^,;.]{0,25}asset inventory|asset inventory[^,;.]{0,25}\(?\bR2\b/.test(line);
      const r4Swap = /\bR4\b[^,;.]{0,25}public trust|public trust[^,;.]{0,25}\(?\bR4\b/.test(line);
      return r2Swap || r4Swap;
    },
    message:
      'Risk-register ID/title swap; canonical is R2 = perimeter monitoring, R4 = asset inventory, R5 = public trust.',
  },
  {
    id: 'stale-observation-date',
    kind: 'content',
    // The assessment cycle is CY2026; observation fieldwork dates before 2026
    // are legacy values (the fiction's genuine pre-2026 dates — incidents,
    // funding — never appear in an Observation Date header).
    regex: /\*\*Observation Date:\*\* 202[0-5]-/,
    message: 'Observation dates belong to the CY2026 assessment cycle (Q1 fieldwork starts 2026-01-01).',
  },
  {
    id: 'control-filename',
    kind: 'filename',
    regex: /-Ex\d+\.md$/,
    message: 'Control filename uses legacy "-ExN"; canonical form is "_ExN".',
  },
];

const CONTENT_RULES = RULES.filter((rule) => rule.kind === 'content');
const FILENAME_RULES = RULES.filter((rule) => rule.kind === 'filename');

const scriptPath = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(scriptPath), '..');
const catalogDir = path.join(repoRoot, 'ASSESSMENT_CATALOG');
const controlsDir = path.join(catalogDir, '2_Controls');

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return null;
  return args[idx + 1] ?? null;
};

const usage = () => {
  console.log('Scan ASSESSMENT_CATALOG Markdown and CSV files for noncanonical Alma facts.');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/coherence-lint.mjs [--quiet]');
  console.log('');
  console.log('Options:');
  console.log('  --quiet    Print only the summary line.');
  console.log('  -h, --help Print this help text.');
};

const toRepoRelativePath = (filePath) => {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
};

const isMarkdownOrCsv = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.md' || ext === '.csv';
};

const readDirectory = (dirPath) => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch (err) {
    throw new Error(`Failed to read directory ${dirPath}: ${err.message}`);
  }
};

const readTextFile = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
};

const findCatalogFiles = (dirPath) => {
  const entries = readDirectory(dirPath).sort((a, b) => a.name.localeCompare(b.name));
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...findCatalogFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      if (isMarkdownOrCsv(entryPath)) {
        files.push(entryPath);
      }

      continue;
    }
  }

  return files;
};

const isContentRuleExempt = (repoRelativePath) => {
  return CONTENT_RULE_EXEMPTIONS.includes(repoRelativePath);
};

const isUnderDirectory = (filePath, dirPath) => {
  const relativePath = path.relative(dirPath, filePath);
  return relativePath !== '' && !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
};

const ruleMatchesLine = (rule, line) => {
  if (rule.regex) {
    return rule.regex.test(line);
  }

  if (rule.matches) {
    return rule.matches(line);
  }

  return false;
};

const scanContentRules = (filePath, repoRelativePath) => {
  if (isContentRuleExempt(repoRelativePath)) {
    return [];
  }

  const text = readTextFile(filePath);
  const lines = text.split(/\r?\n/);
  const violations = [];

  lines.forEach((line, index) => {
    for (const rule of CONTENT_RULES) {
      if (ruleMatchesLine(rule, line)) {
        violations.push({
          file: repoRelativePath,
          line: index + 1,
          id: rule.id,
          message: rule.message,
        });
      }
    }
  });

  return violations;
};

const scanFilenameRules = (filePath, repoRelativePath) => {
  if (!isUnderDirectory(filePath, controlsDir)) {
    return [];
  }

  const basename = path.basename(filePath);
  const violations = [];

  for (const rule of FILENAME_RULES) {
    if (rule.regex.test(basename)) {
      violations.push({
        file: repoRelativePath,
        line: 1,
        id: rule.id,
        message: rule.message,
      });
    }
  }

  return violations;
};

const compareViolations = (a, b) => {
  const fileOrder = a.file.localeCompare(b.file);
  if (fileOrder !== 0) return fileOrder;

  const lineOrder = a.line - b.line;
  if (lineOrder !== 0) return lineOrder;

  return a.id.localeCompare(b.id);
};

const printResults = (violations, quiet) => {
  const sortedViolations = [...violations].sort(compareViolations);

  if (!quiet) {
    for (const violation of sortedViolations) {
      console.log(`${violation.file}:${violation.line}: [${violation.id}] ${violation.message}`);
    }
  }

  if (sortedViolations.length === 0) {
    console.log('No violations found.');
    return;
  }

  const affectedFiles = new Set(sortedViolations.map((violation) => violation.file));
  console.log(`${sortedViolations.length} violation(s) found across ${affectedFiles.size} file(s).`);
};

const hasHelpFlag = args.includes('--help') || args.includes('-h');
const quiet = args.includes('--quiet');
const allowedArgs = new Set(['--quiet', '--help', '-h']);
const unknownArg = args.find((arg) => !allowedArgs.has(arg));
const invalidValuedArg = getArg('--quiet') !== null || getArg('--help') !== null || getArg('-h') !== null;

if (hasHelpFlag) {
  usage();
  process.exit(0);
}

if (unknownArg || invalidValuedArg) {
  usage();
  process.exit(1);
}

const catalogFiles = findCatalogFiles(catalogDir);
const violations = [];

for (const filePath of catalogFiles) {
  const repoRelativePath = toRepoRelativePath(filePath);
  violations.push(...scanFilenameRules(filePath, repoRelativePath));
  violations.push(...scanContentRules(filePath, repoRelativePath));
}

printResults(violations, quiet);
process.exit(violations.length > 0 ? 1 : 0);
