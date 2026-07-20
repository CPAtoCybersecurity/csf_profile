/**
 * Egress census — the surface-grain guard.
 *
 * The share-export registry (shareRegistry.js) governs FIELDS within the JSON
 * share serializer. This test governs SURFACES: every file that can hand data
 * to the browser as a download (URL.createObjectURL) or a direct file save
 * (jsPDF doc.save) must appear in the inventory below with a declared posture.
 *
 * Why: the four historical share leaks all entered as APPEARANCES — a new
 * field or surface born fail-open that no scrub knew about. A field registry
 * cannot see a brand-new exporter. This census can: add a download to a file
 * not listed here and this test fails, forcing a disposition decision at
 * commit time instead of a silent leak found by an adjacent issue.
 *
 * Postures (documentation, asserted only as presence):
 *  - 'share-registry'    JSON share path — field dispositions enforced by
 *                        shareRegistry.js + shareRegistry.test.js
 *  - 'complete-backup'   wholesale by design (restore needs everything)
 *  - 'working-artifact'  personal-use export (CSV/JSON/PDF/markdown) that may
 *                        carry tailored text, names, links — the DOCUMENTED
 *                        EXCEPTION in PRIVATE_DATA.md: these are not the
 *                        sharing surface and are not scrubbed
 *  - 'static-template'   fixed content, no user data
 */
import fs from 'fs';
import path from 'path';

const SRC = path.join(process.cwd(), 'src');

// file (relative to src/) -> posture. Every entry is a deliberate decision;
// see PRIVATE_DATA.md "Egress surfaces" for the reasoning per posture.
const EGRESS_INVENTORY = {
  'utils/dataExport.js': 'share-registry', // downloadJSON: share + complete + assessments JSON
  'utils/dataMigration.js': 'complete-backup', // pre-restore safety backup
  'utils/executiveSummaryPDF.js': 'working-artifact', // jsPDF doc.save
  'utils/auditReportMarkdown.js': 'working-artifact',
  'utils/metricsImport.js': 'working-artifact', // metrics catalogue re-export
  'stores/assessmentsStore.js': 'working-artifact', // 4 CSV exports (2 encryptable)
  'stores/controlsStore.js': 'working-artifact', // CSV + JSON
  'stores/requirementsStore.js': 'working-artifact',
  'stores/findingsStore.js': 'working-artifact',
  'stores/artifactStore.js': 'working-artifact',
  'stores/auditLogStore.js': 'working-artifact',
  'pages/Assessments.js': 'working-artifact', // comparison CSV
  'pages/UserControls.js': 'working-artifact',
  'pages/UserManagement.js': 'working-artifact', // user directory CSV (PII, personal use)
  'pages/Settings.js': 'static-template', // CSV import template download
  'hooks/useCSFData.js': 'working-artifact'
};

const VALID_POSTURES = new Set([
  'share-registry',
  'complete-backup',
  'working-artifact',
  'static-template'
]);

// A file is an egress surface when it creates a downloadable object URL or
// saves a jsPDF document. Comments are stripped first so prose mentioning the
// APIs (e.g. sanitize.js's csvFormulaGuard docs) does not count as a surface.
const EGRESS_PATTERN = /URL\.createObjectURL\s*\(|doc\.save\s*\(/;

const stripComments = (code) =>
  code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

const walk = (dir, out = []) => {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__fixtures__' || entry.name === 'node_modules') return;
      walk(full, out);
    } else if (
      entry.name.endsWith('.js') &&
      !entry.name.endsWith('.test.js') &&
      !entry.name.endsWith('.setup.js')
    ) {
      out.push(full);
    }
  });
  return out;
};

describe('egress census', () => {
  const egressFiles = walk(SRC)
    .filter((f) => EGRESS_PATTERN.test(stripComments(fs.readFileSync(f, 'utf8'))))
    .map((f) => path.relative(SRC, f).split(path.sep).join('/'))
    .sort();

  test('every egress surface is inventoried with a declared posture', () => {
    const undeclared = egressFiles.filter((f) => !(f in EGRESS_INVENTORY));
    expect(undeclared).toEqual([]);
  });

  test('no inventory entry is stale (file gone or no longer an egress surface)', () => {
    const current = new Set(egressFiles);
    const stale = Object.keys(EGRESS_INVENTORY).filter((f) => !current.has(f));
    expect(stale).toEqual([]);
  });

  test('every posture is a known value', () => {
    Object.entries(EGRESS_INVENTORY).forEach(([, posture]) => {
      expect(VALID_POSTURES.has(posture)).toBe(true);
    });
  });

  test('polarity: the pattern actually detects a new egress surface', () => {
    // Executes the same detection used above on synthetic code — if the
    // pattern regresses, this fails rather than the census silently passing.
    expect(EGRESS_PATTERN.test('const u = URL.createObjectURL(blob);')).toBe(true);
    expect(EGRESS_PATTERN.test('doc.save("report.pdf");')).toBe(true);
    expect(EGRESS_PATTERN.test(stripComments('// URL.createObjectURL( in prose'))).toBe(false);
  });
});
