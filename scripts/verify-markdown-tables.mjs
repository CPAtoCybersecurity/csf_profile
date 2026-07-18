// End-to-end proof for issue #276: the shared Markdown wrapper's plugin config
// (react-markdown + remark-gfm) turns a GFM pipe table into a real <table>,
// AND enabling gfm on every render site does not regress non-table content.
//
// Jest cannot import this ESM chain in CRA (see src/components/Markdown.test.js),
// so this standalone Node script renders the REAL library output and asserts:
//   1. a GFM table becomes a real <table> with <th>/<td>
//   2. bare react-markdown produces NO table (the plugin is what fixes it)
//   3. non-table content is unaffected or correctly upgraded (blast-radius check)
//
// Run: node scripts/verify-markdown-tables.mjs   (exit 0 = pass, 1 = fail)

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const render = (md, gfm) =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, gfm ? { remarkPlugins: [remarkGfm] } : null, md)
  );

const TABLE_MD = [
  '| Indicator | Source | Frequency |',
  '|-----------|--------|-----------|',
  '| Time to Detect (TTD) | SOC metrics dashboard | Monthly |',
  '| GuardDuty finding volume | AWS Security Hub | Daily |',
].join('\n');

const withGfmTable = render(TABLE_MD, true);
const withoutGfmTable = render(TABLE_MD, false);

// Blast-radius: what changes for non-table content when gfm is enabled everywhere.
const PROSE = '# Title\n\nSome **bold** and a bullet:\n\n- one\n- two';
const STRAY_PIPE = 'Throughput is 10 | 20 depending on region.';
const TASK_LIST = '## Evidence\n\n- [ ] CloudTrail export\n- [x] GuardDuty screenshot';
const BARE_URL = 'See https://example.com/policy for details.';

const checks = [
  // The fix
  ['gfm renders a <table> element', /<table>/.test(withGfmTable)],
  ['gfm renders <th> header cells', /<th>Indicator<\/th>/.test(withGfmTable)],
  ['gfm renders cell text inside <td>', /<td>Time to Detect \(TTD\)<\/td>/.test(withGfmTable)],
  ['bare react-markdown produces NO table (proves the plugin is the fix)', !/<table>/.test(withoutGfmTable)],
  // No regression to the common case
  ['plain prose is byte-identical with/without gfm', render(PROSE, true) === render(PROSE, false)],
  ['a stray pipe (no delimiter row) does NOT become a table', render(STRAY_PIPE, true) === render(STRAY_PIPE, false) && !/<table>/.test(render(STRAY_PIPE, true))],
  // Intended gfm upgrades (correct behavior, not breakage)
  ['task-list "- [ ]" becomes a clean disabled checkbox', /<input type="checkbox" disabled=""\/>/.test(render(TASK_LIST, true))],
  ['task-list stays inside a <ul> (no layout break)', /<ul class="contains-task-list">/.test(render(TASK_LIST, true))],
  ['bare URL becomes a clickable link', /<a href="https:\/\/example\.com\/policy">/.test(render(BARE_URL, true))],
];

let ok = true;
for (const [label, pass] of checks) {
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}`);
  if (!pass) ok = false;
}

if (!ok) {
  console.error('\nissue #276 verification FAILED');
  process.exit(1);
}
console.log('\nissue #276 verification PASSED — tables render; non-table content is unaffected or correctly upgraded.');
