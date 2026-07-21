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

describe('report surfaces never render procedure text (plan §7 R-9 rot-stopper)', () => {
  // The claim "no report/PDF surface renders testProcedures" was a grep FACT
  // with no pin — so it could rot silently the day a report gained the
  // field. This turns it into an invariant: the report generators must not
  // reference testProcedures (or the platform reference field) at all. If a
  // report legitimately needs procedure text one day, it must consume the
  // expansion choke point (expandProcedureText) so attribution and
  // placeholder semantics ride along — update this test deliberately then.
  const REPORT_SURFACES = ['utils/auditReportMarkdown.js', 'utils/executiveSummaryPDF.js'];

  test.each(REPORT_SURFACES)('%s does not reference testProcedures or platformProcedures', (rel) => {
    const code = stripComments(fs.readFileSync(path.join(SRC, rel), 'utf8'));
    expect(code).not.toMatch(/testProcedures/);
    expect(code).not.toMatch(/platformProcedures/);
  });
});

describe('choke-point wiring rot-stoppers (PR-5)', () => {
  const read = (rel) => stripComments(fs.readFileSync(path.join(SRC, rel), 'utf8'));

  test('the detail-panel render egress routes through expandProcedureText (positive pin)', () => {
    // The fifth choke-point consumer. A revert of the render call-site swap
    // to raw currentObservation.testProcedures would show trunk-only text on
    // screen while every export carries the full expansion — this pin makes
    // that revert red without mounting the page.
    const page = read('pages/Assessments.js');
    expect(page).toMatch(/expandProcedureText\(currentObservation\)/);
  });

  test('every store egress emission routes through the choke point (residual count-pin)', () => {
    // assessmentsStore.js legitimately reads obs.testProcedures in exactly
    // FOUR non-egress places: the frozen v14 migration block (3 reads) and
    // the observations→evaluations migration (1 read). The four CSV/Jira
    // egress emissions all call expandProcedureText(obs) — 5 call sites
    // (exportForJiraCSV emits twice: custom field + description). Pin both
    // counts: a NEW exporter written against obs.testProcedures bumps the
    // residual count and goes red here, forcing the expansion decision at
    // commit time instead of a silent trunk-only artifact.
    const store = read('stores/assessmentsStore.js');
    const residualReads = (store.match(/obs\.testProcedures/g) || []).length;
    const chokeCalls = (store.match(/expandProcedureText\(obs\)/g) || []).length;
    expect(chokeCalls).toBe(5);
    expect(residualReads).toBe(4);
  });

  test('composition-writer guard: only sanctioned modules write the reference/recipe keys', () => {
    // Reset replays procedureSource.components verbatim, so the recipe and
    // the live platformProcedures array must be written together — funneled
    // through the compose/reset producers. A new writer outside this set
    // (e.g. a PR-6 UI splicing the live array without re-recording the
    // recipe) must show up here and force the review.
    const WRITERS = new Set([
      'utils/procedureBank.js', // resetToCommunityUpdate recipe replay
      'utils/procedureTailor.js', // composeAttachObservation
      'utils/shareRegistry.js' // registry DECLARATION of the field (not a write)
    ]);
    // Write-shaped matches only: an object-literal key (`platformProcedures:`
    // on one line) or a property assignment (`.platformProcedures =`).
    // Multiline ternary READS (expansion) deliberately do not match.
    const WRITE_PATTERN = /platformProcedures:|\.platformProcedures\s*=[^=]/;
    const offenders = [];
    walk(SRC).forEach((full) => {
      const rel = path.relative(SRC, full);
      if (WRITE_PATTERN.test(stripComments(fs.readFileSync(full, 'utf8'))) && !WRITERS.has(rel)) {
        offenders.push(rel);
      }
    });
    expect(offenders).toEqual([]);
  });
});
