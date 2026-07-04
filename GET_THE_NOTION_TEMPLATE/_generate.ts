import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

/*
 * NIST CSF Notion template generator — ONE generator, ONE source of truth.
 *
 * SOURCE OF TRUTH (issue #242): the app's exported profile CSV,
 *   GET_THE_SPREADSHEETS/yyyy-mm-dd_CSF_Profile.csv
 * which is itself the flat, columnar export of the app pipeline
 *   ASSESSMENT_CATALOG/ -> scripts/generate-comprehensive-assessment.mjs -> app store -> CSV.
 * The CSV is chosen (over re-parsing ASSESSMENT_CATALOG) because it already
 * carries the full quarterly GRC schema issue #243 asks us to mirror — Q1-Q4
 * scores/observations, NIST 800-53 refs, scoping, Examine/Interview/Test,
 * remediation, auditor, stakeholders — so consuming it keeps us to a single
 * generator with no second parser to drift. The legacy
 * source/CSF-implementation-examples.csv was a strict 9-column projection of
 * this file and has been deleted; it is fully derivable and is no longer a
 * second source of truth.
 *
 * This generator regenerates ALL derived outputs, including the CSF_Wiki/
 * Notion drag-import bundle (previously a one-time hand export). It NEVER
 * clobbers hand-curated README prose: it only rewrites content between
 * explicit <!-- BEGIN GENERATED: name --> / <!-- END GENERATED: name -->
 * markers, leaving everything else byte-identical.
 *
 * Run:  bun GET_THE_NOTION_TEMPLATE/_generate.ts
 */

const OUTPUT_DIR = import.meta.dir;
const REPO_ROOT = join(OUTPUT_DIR, "..");
const SPREADSHEETS_DIR = join(REPO_ROOT, "GET_THE_SPREADSHEETS");

const SOURCE_CSV_PATH =
  Bun.argv[2] ??
  process.env.CSF_SOURCE_CSV ??
  join(SPREADSHEETS_DIR, "yyyy-mm-dd_CSF_Profile.csv");
const FINDINGS_CSV_PATH =
  process.env.CSF_FINDINGS_CSV ?? join(SPREADSHEETS_DIR, "JIRA-Findings.csv");
const ARTIFACTS_CSV_PATH =
  process.env.CSF_ARTIFACTS_CSV ?? join(SPREADSHEETS_DIR, "JIRA-Artifacts.csv");

const SUBCATEGORIES_DIR = join(OUTPUT_DIR, "subcategories");
const BUNDLE_DIR = join(OUTPUT_DIR, "CSF_Wiki");
const BUNDLE_INNER = join(BUNDLE_DIR, "CSF_Wiki");
const README_PATH = join(OUTPUT_DIR, "README.md");

// Minimum leading columns the app profile CSV must expose. The file carries
// ~53 columns; we assert the first nine (shared with the legacy source) plus a
// spot check on the quarterly columns so a malformed export fails loudly.
const REQUIRED_SOURCE_COLUMNS = [
  "ID",
  "Function",
  "Function Description",
  "Category ID",
  "Category",
  "Category Description",
  "Subcategory ID",
  "Subcategory Description",
  "Implementation Example",
  "Implementation Description",
  "In Scope? ",
  "Owner",
  "Stakeholder(s)",
  "Auditor",
  "NIST 800-53 Control Ref",
  "Test Procedure(s)",
  "Q1 Actual Score",
  "Q4 Test",
  "Remediation Owner",
  "Remediation Due Date",
  "Minimum Target",
  "Action Plan",
  "Artifact Name",
] as const;

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"] as const;
type Quarter = (typeof QUARTERS)[number];

type CsvRow = string[];

interface QuarterAssessment {
  actual: string;
  target: string;
  observations: string;
  observationDate: string;
  testingStatus: string;
  examine: string;
  interview: string;
  test: string;
}

interface Assessment {
  inScope: string;
  owner: string;
  stakeholders: string;
  auditor: string;
  nist80053: string;
  testProcedures: string;
  quarters: Record<Quarter, QuarterAssessment>;
  remediationOwner: string;
  remediationDue: string;
  minimumTarget: string;
  actionPlan: string;
  artifactName: string;
}

interface ExampleRow {
  id: string;
  text: string;
  implementation: string;
}

interface SubcategoryRow {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  functionId: string;
  functionName: string;
  assessment: Assessment;
  examples: ExampleRow[];
  score: string; // current actual (latest populated quarter)
  targetScore: string; // current target (latest populated quarter, else minimum)
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  functionId: string;
  subcategoryIds: string[];
  actualScore: string;
  targetScore: string;
}

interface FunctionRow {
  id: string;
  name: string;
  description: string;
  categoryIds: string[];
  subcategoryIds: string[];
  actualScore: string;
  targetScore: string;
}

interface FindingRow {
  summary: string;
  subcategoryId: string;
  issueKey: string;
  issueType: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  dueDate: string;
  rootCause: string;
  vulnerability: string;
  remediationPlan: string;
  testingStatus: string;
  description: string;
}

interface ArtifactRow {
  summary: string;
  subcategoryId: string;
  issueKey: string;
  issueType: string;
  status: string;
  priority: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  link: string;
  description: string;
}

interface SourceData {
  functions: FunctionRow[];
  categories: CategoryRow[];
  subcategories: SubcategoryRow[];
  findings: FindingRow[];
  artifacts: ArtifactRow[];
  exampleCount: number;
}

// ---------------------------------------------------------------------------
// CSV parsing / writing (RFC 4180 character-walk state machine)
// ---------------------------------------------------------------------------

function parseCsv(source: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (inQuotes) {
      if (character === '"') {
        if (source[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    if (character === "\r") {
      if (source[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (inQuotes) {
    throw new Error("Malformed CSV: unterminated quoted field at end of file.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function quoteCsvField(value: string): string {
  if (
    value.includes(",") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function writeCsvText(rows: CsvRow[]): string {
  return rows
    .map((row: CsvRow) => row.map((value: string) => quoteCsvField(value)).join(","))
    .join("\n");
}

function stripBom(value: string): string {
  return value.replace(/^﻿/, "");
}

/** Build a header->index lookup, BOM-stripped and trimmed-key tolerant. */
function headerIndexer(header: CsvRow): (name: string) => number {
  const map = new Map<string, number>();
  header.forEach((raw, index) => {
    map.set(stripBom(raw), index);
  });
  return (name: string): number => {
    if (map.has(name)) {
      return map.get(name) as number;
    }
    // tolerate trailing-space differences between exports
    for (const [key, index] of map) {
      if (key.trim() === name.trim()) {
        return index;
      }
    }
    return -1;
  };
}

// ---------------------------------------------------------------------------
// Field parsing helpers (shared with the legacy generator)
// ---------------------------------------------------------------------------

function extractFunctionId(value: string): { shortId: string; longName: string } {
  const match = /^(.+?)\s*\(([A-Z]{2})\)\s*$/.exec(value);
  if (!match) {
    throw new Error(
      `Invalid Function value "${value}". Expected format like "GOVERN (GV)".`,
    );
  }
  return { shortId: match[2], longName: match[1].trim() };
}

function stripCategorySuffix(value: string): string {
  const match = /^(.*?)\s*\(([A-Z]{2}\.[A-Z]{2})\)\s*$/.exec(value);
  if (!match) {
    throw new Error(
      `Invalid Category value "${value}". Expected a trailing suffix like "(GV.SC)".`,
    );
  }
  return match[1].trim();
}

// ---------------------------------------------------------------------------
// Notion export naming: deterministic 32-hex ids + filename conventions
// ---------------------------------------------------------------------------

/** Deterministic 32-hex id (idempotent across runs) mimicking Notion's ids. */
function notionId(key: string): string {
  return createHash("md5").update(key).digest("hex");
}

/**
 * Notion truncates the title portion of an exported filename to 50 chars and
 * replaces filesystem-hostile characters (including "." and "/") with spaces.
 */
function fileBaseName(title: string, id: string): string {
  const cleaned = title
    .replace(/[./\\?%*:|"<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50)
    .trim();
  return `${cleaned} ${id}`;
}

/** URL-encode a bundle-relative path Notion-style: spaces -> %20, commas kept. */
function encodePath(path: string): string {
  return path.replaceAll(" ", "%20");
}

function relationCell(display: string, relativePathNoExt: string, ext: string): string {
  return `${display} (${encodePath(relativePathNoExt)}.${ext})`;
}

// ---------------------------------------------------------------------------
// Score helpers
// ---------------------------------------------------------------------------

function latestPopulated(values: string[]): string {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (values[index] && values[index].trim() !== "") {
      return values[index].trim();
    }
  }
  return "";
}

function average(values: string[]): string {
  const numbers = values
    .map((value) => Number.parseFloat(value))
    .filter((value) => Number.isFinite(value));
  if (numbers.length === 0) {
    return "";
  }
  const sum = numbers.reduce((total, value) => total + value, 0);
  return String(sum / numbers.length);
}

// ---------------------------------------------------------------------------
// YAML frontmatter (single-line values only; multi-line content -> body)
// ---------------------------------------------------------------------------

function renderYamlField(key: string, rawValue: string): string {
  const value = rawValue.replace(/\s*\n\s*/g, " ").trim();
  if (value.length === 0) {
    return `${key}:`;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return `${key}: ${value}`;
  }
  return `${key}: '${value.replaceAll("'", "''")}'`;
}

// ---------------------------------------------------------------------------
// Load + shape the source of truth
// ---------------------------------------------------------------------------

function emptyQuarter(): QuarterAssessment {
  return {
    actual: "",
    target: "",
    observations: "",
    observationDate: "",
    testingStatus: "",
    examine: "",
    interview: "",
    test: "",
  };
}

async function loadSource(): Promise<SourceData> {
  const text = await readFile(SOURCE_CSV_PATH, "utf8");
  const rows = parseCsv(text);
  if (rows.length < 2) {
    throw new Error(`Source CSV is empty or headerless: ${SOURCE_CSV_PATH}`);
  }

  const header = rows[0];
  const col = headerIndexer(header);

  for (const required of REQUIRED_SOURCE_COLUMNS) {
    if (col(required) < 0) {
      throw new Error(
        `Source CSV missing required column "${required}" in ${SOURCE_CSV_PATH}.`,
      );
    }
  }

  const idIdx = col("ID");
  const functionIdx = col("Function");
  const functionDescIdx = col("Function Description");
  const categoryIdIdx = col("Category ID");
  const categoryIdx = col("Category");
  const categoryDescIdx = col("Category Description");
  const subIdIdx = col("Subcategory ID");
  const subDescIdx = col("Subcategory Description");
  const exampleIdx = col("Implementation Example");
  const implIdx = col("Implementation Description");

  const functionsById = new Map<string, FunctionRow>();
  const categoriesById = new Map<string, CategoryRow>();
  const subcategoriesById = new Map<string, SubcategoryRow>();
  let exampleCount = 0;

  const dataRows = rows
    .slice(1)
    .filter((row) => row.length > 1 && (row[idIdx] ?? "").trim() !== "");

  for (const row of dataRows) {
    const cell = (index: number): string => (index >= 0 ? row[index] ?? "" : "");

    const functionParts = extractFunctionId(cell(functionIdx));
    const categoryName = stripCategorySuffix(cell(categoryIdx));
    const functionId = functionParts.shortId;
    const categoryId = cell(categoryIdIdx);
    const subId = cell(subIdIdx);

    if (!functionsById.has(functionId)) {
      functionsById.set(functionId, {
        id: functionId,
        name: functionParts.longName,
        description: cell(functionDescIdx),
        categoryIds: [],
        subcategoryIds: [],
        actualScore: "",
        targetScore: "",
      });
    }

    if (!categoriesById.has(categoryId)) {
      categoriesById.set(categoryId, {
        id: categoryId,
        name: categoryName,
        description: cell(categoryDescIdx),
        functionId,
        subcategoryIds: [],
        actualScore: "",
        targetScore: "",
      });
      functionsById.get(functionId)?.categoryIds.push(categoryId);
    }

    if (!subcategoriesById.has(subId)) {
      const quarters: Record<Quarter, QuarterAssessment> = {
        Q1: emptyQuarter(),
        Q2: emptyQuarter(),
        Q3: emptyQuarter(),
        Q4: emptyQuarter(),
      };
      for (const quarter of QUARTERS) {
        quarters[quarter] = {
          actual: cell(col(`${quarter} Actual Score`)),
          target: cell(col(`${quarter} Target Score`)),
          observations: cell(col(`${quarter} Observations`)),
          observationDate: cell(col(`${quarter} Observation Date`)),
          testingStatus: cell(col(`${quarter} Testing Status`)),
          examine: cell(col(`${quarter} Examine`)),
          interview: cell(col(`${quarter} Interview`)),
          test: cell(col(`${quarter} Test`)),
        };
      }

      const assessment: Assessment = {
        inScope: cell(col("In Scope? ")),
        owner: cell(col("Owner")),
        stakeholders: cell(col("Stakeholder(s)")),
        auditor: cell(col("Auditor")),
        nist80053: cell(col("NIST 800-53 Control Ref")),
        testProcedures: cell(col("Test Procedure(s)")),
        quarters,
        remediationOwner: cell(col("Remediation Owner")),
        remediationDue: cell(col("Remediation Due Date")),
        minimumTarget: cell(col("Minimum Target")),
        actionPlan: cell(col("Action Plan")),
        artifactName: cell(col("Artifact Name")),
      };

      const score = latestPopulated(QUARTERS.map((quarter) => quarters[quarter].actual));
      const latestTarget = latestPopulated(
        QUARTERS.map((quarter) => quarters[quarter].target),
      );

      subcategoriesById.set(subId, {
        id: subId,
        description: cell(subDescIdx),
        categoryId,
        categoryName,
        functionId,
        functionName: functionParts.longName,
        assessment,
        examples: [],
        score,
        targetScore: latestTarget || assessment.minimumTarget,
      });
      categoriesById.get(categoryId)?.subcategoryIds.push(subId);
      functionsById.get(functionId)?.subcategoryIds.push(subId);
    }

    const subcategory = subcategoriesById.get(subId);
    if (subcategory) {
      subcategory.examples.push({
        id: cell(idIdx),
        text: cell(exampleIdx),
        implementation: cell(implIdx),
      });
      exampleCount += 1;
    }
  }

  // Compute category / function rollup snapshots (Notion recomputes these live
  // once relations are wired; we ship a static snapshot so the demo is populated).
  const categories = [...categoriesById.values()];
  for (const category of categories) {
    const subs = category.subcategoryIds
      .map((id) => subcategoriesById.get(id))
      .filter((sub): sub is SubcategoryRow => Boolean(sub));
    category.actualScore = average(subs.map((sub) => sub.score));
    category.targetScore = average(subs.map((sub) => sub.targetScore));
  }

  const functions = [...functionsById.values()];
  for (const fn of functions) {
    const cats = fn.categoryIds
      .map((id) => categoriesById.get(id))
      .filter((cat): cat is CategoryRow => Boolean(cat));
    fn.actualScore = average(cats.map((cat) => cat.actualScore));
    fn.targetScore = average(cats.map((cat) => cat.targetScore));
  }

  const sortById = <T extends { id: string }>(list: T[]): T[] =>
    [...list].sort((left, right) => left.id.localeCompare(right.id));

  const subcategories = sortById([...subcategoriesById.values()]).map((sub) => ({
    ...sub,
    examples: [...sub.examples].sort((left, right) =>
      left.id.localeCompare(right.id, undefined, { numeric: true }),
    ),
  }));

  const knownSubIds = new Set(subcategories.map((sub) => sub.id));
  const findings = await loadFindings(knownSubIds);
  const artifacts = await loadArtifacts(knownSubIds);

  const data: SourceData = {
    functions: sortById(functions),
    categories: sortById(categories),
    subcategories,
    findings,
    artifacts,
    exampleCount,
  };

  validateCounts(data);
  return data;
}

function validateCounts(data: SourceData): void {
  if (data.functions.length !== 6) {
    throw new Error(`Expected 6 functions, found ${data.functions.length}.`);
  }
  if (data.categories.length !== 22) {
    throw new Error(`Expected 22 categories, found ${data.categories.length}.`);
  }
  if (data.subcategories.length !== 106) {
    throw new Error(`Expected 106 subcategories, found ${data.subcategories.length}.`);
  }
}

// ---------------------------------------------------------------------------
// Findings / Artifacts (mirror the JIRA exports, add a relation-ready column)
// ---------------------------------------------------------------------------

const SUBCATEGORY_ID_RE = /[A-Z]{2}\.[A-Z]{2}-\d{2}/;

function firstSubcategoryId(haystacks: string[], known: Set<string>): string {
  for (const text of haystacks) {
    const match = SUBCATEGORY_ID_RE.exec(text ?? "");
    if (match && known.has(match[0])) {
      return match[0];
    }
  }
  return "";
}

async function loadFindings(known: Set<string>): Promise<FindingRow[]> {
  if (!existsSync(FINDINGS_CSV_PATH)) {
    console.warn(`WARN: findings source not found, emitting empty Findings DB: ${FINDINGS_CSV_PATH}`);
    return [];
  }
  const rows = parseCsv(await readFile(FINDINGS_CSV_PATH, "utf8"));
  if (rows.length < 2) return [];
  const col = headerIndexer(rows[0]);
  const cell = (row: CsvRow, name: string): string => {
    const index = col(name);
    return index >= 0 ? row[index] ?? "" : "";
  };

  return rows
    .slice(1)
    .filter((row) => (cell(row, "Issue key") || cell(row, "Summary")).trim() !== "")
    .map((row) => {
      const summary = cell(row, "Summary");
      const description = cell(row, "Description");
      const controlLink = cell(row, "Custom field (Control Link)");
      const compliance = cell(row, "Custom field (Compliance Requirement)");
      return {
        summary,
        subcategoryId: firstSubcategoryId(
          [summary, description, controlLink, compliance],
          known,
        ),
        issueKey: cell(row, "Issue key"),
        issueType: cell(row, "Issue Type"),
        status: cell(row, "Status"),
        priority: cell(row, "Priority"),
        assignee: cell(row, "Assignee"),
        reporter: cell(row, "Reporter"),
        created: cell(row, "Created"),
        updated: cell(row, "Updated"),
        dueDate: cell(row, "Due date"),
        rootCause: cell(row, "Custom field (Root Cause)"),
        vulnerability: cell(row, "Custom field (Vulnerability)"),
        remediationPlan: cell(
          row,
          "Custom field (Remediation Action Plan (Who will do What by When?) )",
        ),
        testingStatus: cell(row, "Custom field (Testing Status)"),
        description,
      };
    });
}

async function loadArtifacts(known: Set<string>): Promise<ArtifactRow[]> {
  if (!existsSync(ARTIFACTS_CSV_PATH)) {
    console.warn(`WARN: artifacts source not found, emitting empty Artifacts DB: ${ARTIFACTS_CSV_PATH}`);
    return [];
  }
  const rows = parseCsv(await readFile(ARTIFACTS_CSV_PATH, "utf8"));
  if (rows.length < 2) return [];
  const col = headerIndexer(rows[0]);
  const cell = (row: CsvRow, name: string): string => {
    const index = col(name);
    return index >= 0 ? row[index] ?? "" : "";
  };

  return rows
    .slice(1)
    .filter((row) => (cell(row, "Issue key") || cell(row, "Summary")).trim() !== "")
    .map((row) => {
      const summary = cell(row, "Summary");
      const description = cell(row, "Description");
      const controlLink = cell(row, "Custom field (Control Link)");
      const link = cell(row, "Custom field (Link)");
      return {
        summary,
        subcategoryId: firstSubcategoryId([summary, description, controlLink], known),
        issueKey: cell(row, "Issue key"),
        issueType: cell(row, "Issue Type"),
        status: cell(row, "Status"),
        priority: cell(row, "Priority"),
        assignee: cell(row, "Assignee"),
        reporter: cell(row, "Reporter"),
        created: cell(row, "Created"),
        updated: cell(row, "Updated"),
        link: controlLink || link,
        description,
      };
    });
}

// ---------------------------------------------------------------------------
// Shared column schemas
// ---------------------------------------------------------------------------

const SUBCATEGORY_COLUMNS: string[] = [
  "ID",
  "Category",
  "Function",
  "Description",
  "In Scope?",
  "Owner",
  "Stakeholders",
  "Auditor",
  "NIST 800-53 Control Ref",
  "Test Procedures",
  "Score",
  "Target Score",
  ...QUARTERS.flatMap((quarter) => [
    `${quarter} Actual Score`,
    `${quarter} Target Score`,
    `${quarter} Observations`,
    `${quarter} Observation Date`,
    `${quarter} Testing Status`,
    `${quarter} Examine`,
    `${quarter} Interview`,
    `${quarter} Test`,
  ]),
  "Remediation Owner",
  "Remediation Due Date",
  "Minimum Target",
  "Action Plan",
  "Artifact Name",
];

const FINDINGS_COLUMNS: string[] = [
  "Summary",
  "Subcategory ID",
  "Issue Key",
  "Issue Type",
  "Status",
  "Priority",
  "Assignee",
  "Reporter",
  "Created",
  "Updated",
  "Due Date",
  "Root Cause",
  "Vulnerability",
  "Remediation Action Plan",
  "Testing Status",
  "Description",
];

const ARTIFACTS_COLUMNS: string[] = [
  "Summary",
  "Subcategory ID",
  "Issue Key",
  "Issue Type",
  "Status",
  "Priority",
  "Assignee",
  "Reporter",
  "Created",
  "Updated",
  "Link",
  "Description",
];

function subcategoryValues(
  sub: SubcategoryRow,
  categoryCell: string,
  functionCell: string,
): string[] {
  const a = sub.assessment;
  return [
    sub.id,
    categoryCell,
    functionCell,
    sub.description,
    a.inScope,
    a.owner,
    a.stakeholders,
    a.auditor,
    a.nist80053,
    a.testProcedures,
    sub.score,
    sub.targetScore,
    ...QUARTERS.flatMap((quarter) => {
      const q = a.quarters[quarter];
      return [
        q.actual,
        q.target,
        q.observations,
        q.observationDate,
        q.testingStatus,
        q.examine,
        q.interview,
        q.test,
      ];
    }),
    a.remediationOwner,
    a.remediationDue,
    a.minimumTarget,
    a.actionPlan,
    a.artifactName,
  ];
}

function findingValues(finding: FindingRow): string[] {
  return [
    finding.summary,
    finding.subcategoryId,
    finding.issueKey,
    finding.issueType,
    finding.status,
    finding.priority,
    finding.assignee,
    finding.reporter,
    finding.created,
    finding.updated,
    finding.dueDate,
    finding.rootCause,
    finding.vulnerability,
    finding.remediationPlan,
    finding.testingStatus,
    finding.description,
  ];
}

function artifactValues(artifact: ArtifactRow): string[] {
  return [
    artifact.summary,
    artifact.subcategoryId,
    artifact.issueKey,
    artifact.issueType,
    artifact.status,
    artifact.priority,
    artifact.assignee,
    artifact.reporter,
    artifact.created,
    artifact.updated,
    artifact.link,
    artifact.description,
  ];
}

// ---------------------------------------------------------------------------
// Loose files (functions.csv, categories.csv, subcategories.csv, findings.csv,
// artifacts.csv, subcategories/*.md)
// ---------------------------------------------------------------------------

function formatExampleLines(example: ExampleRow): string[] {
  const trimmed = example.text.trim();
  const match = /^(Ex\d+):\s*(.*)$/.exec(trimmed);
  const head = match ? `- **${match[1]}:** ${match[2]}` : `- ${trimmed}`;
  const lines = [head];
  const implementation = example.implementation.trim();
  if (implementation.length > 0) {
    lines.push("");
    for (const paragraph of implementation.split(/\n+/)) {
      lines.push(`  ${paragraph.trim()}`);
    }
  }
  return lines;
}

function buildSubcategoryMarkdown(sub: SubcategoryRow): string {
  const a = sub.assessment;
  const quarterRows = QUARTERS.map((quarter) => {
    const q = a.quarters[quarter];
    return `| ${quarter} | ${q.actual || "—"} | ${q.target || "—"} | ${q.testingStatus || "—"} | ${q.examine || "—"} | ${q.interview || "—"} | ${q.test || "—"} | ${q.observationDate || "—"} |`;
  });

  const observationBlocks = QUARTERS.flatMap((quarter) => {
    const q = a.quarters[quarter];
    if (q.observations.trim() === "") return [];
    return [`**${quarter} observations**`, "", q.observations.trim(), ""];
  });

  const lines = [
    "---",
    renderYamlField("id", sub.id),
    renderYamlField("function_id", sub.functionId),
    renderYamlField("function_name", sub.functionName),
    renderYamlField("category_id", sub.categoryId),
    renderYamlField("category_name", sub.categoryName),
    renderYamlField("in_scope", a.inScope),
    renderYamlField("owner", a.owner),
    renderYamlField("stakeholders", a.stakeholders),
    renderYamlField("auditor", a.auditor),
    renderYamlField("nist_800_53", a.nist80053),
    renderYamlField("score", sub.score),
    renderYamlField("target_score", sub.targetScore),
    renderYamlField("minimum_target", a.minimumTarget),
    renderYamlField("remediation_owner", a.remediationOwner),
    renderYamlField("remediation_due", a.remediationDue),
    renderYamlField("artifact_name", a.artifactName),
    "---",
    "",
    `# ${sub.id} — ${sub.description}`,
    "",
    "## Description",
    "",
    sub.description,
    "",
    "## Quarterly Assessment",
    "",
    "| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |",
    "|---------|--------|--------|----------------|---------|-----------|------|-----------|",
    ...quarterRows,
    "",
    ...observationBlocks,
    "## NIST 800-53 References",
    "",
    a.nist80053.trim().length > 0 ? a.nist80053 : "_None mapped._",
    "",
    "## Test Procedures",
    "",
    a.testProcedures.trim().length > 0
      ? a.testProcedures.trim()
      : "_Add examine / interview / test procedures here._",
    "",
    "## Implementation Examples",
    "",
    ...sub.examples.flatMap((example) => formatExampleLines(example)),
    "",
    "## Remediation / Action Plan",
    "",
    a.actionPlan.trim().length > 0
      ? a.actionPlan.trim()
      : "_Add remediation owner, due date, and action plan here._",
    "",
  ];

  return lines.join("\n");
}

async function emitLooseFiles(data: SourceData): Promise<number> {
  const functionsCsv: CsvRow[] = [
    ["ID", "Name", "Description"],
    ...data.functions.map((fn) => [fn.id, fn.name, fn.description]),
  ];

  const categoriesCsv: CsvRow[] = [
    ["ID", "Name", "Description", "Function"],
    ...data.categories.map((cat) => [cat.id, cat.name, cat.description, cat.functionId]),
  ];

  const subcategoriesCsv: CsvRow[] = [
    SUBCATEGORY_COLUMNS,
    ...data.subcategories.map((sub) =>
      subcategoryValues(sub, sub.categoryId, sub.functionId),
    ),
  ];

  const findingsCsv: CsvRow[] = [
    FINDINGS_COLUMNS,
    ...data.findings.map((finding) => findingValues(finding)),
  ];

  const artifactsCsv: CsvRow[] = [
    ARTIFACTS_COLUMNS,
    ...data.artifacts.map((artifact) => artifactValues(artifact)),
  ];

  await mkdir(SUBCATEGORIES_DIR, { recursive: true });

  const writes: Promise<unknown>[] = [
    writeFile(join(OUTPUT_DIR, "functions.csv"), writeCsvText(functionsCsv), "utf8"),
    writeFile(join(OUTPUT_DIR, "categories.csv"), writeCsvText(categoriesCsv), "utf8"),
    writeFile(join(OUTPUT_DIR, "subcategories.csv"), writeCsvText(subcategoriesCsv), "utf8"),
    writeFile(join(OUTPUT_DIR, "findings.csv"), writeCsvText(findingsCsv), "utf8"),
    writeFile(join(OUTPUT_DIR, "artifacts.csv"), writeCsvText(artifactsCsv), "utf8"),
    ...data.subcategories.map((sub) =>
      writeFile(join(SUBCATEGORIES_DIR, `${sub.id}.md`), buildSubcategoryMarkdown(sub), "utf8"),
    ),
  ];

  await Promise.all(writes);
  return 5 + data.subcategories.length;
}

// ---------------------------------------------------------------------------
// Notion drag-import bundle (CSF_Wiki/)
// ---------------------------------------------------------------------------

interface BundleNames {
  functionBase: Map<string, string>; // functionId -> "DE {id}"
  categoryBase: Map<string, string>; // categoryId -> "Name {id}"
  subcategoryBase: Map<string, string>; // subId -> "DE AE-02 {id}"
  functionsCsv: string;
  categoriesCsv: string;
  subcategoriesCsv: string;
  findingsCsv: string;
  artifactsCsv: string;
  rootPage: string;
}

function buildBundleNames(data: SourceData): BundleNames {
  const functionBase = new Map<string, string>();
  const categoryBase = new Map<string, string>();
  const subcategoryBase = new Map<string, string>();

  for (const fn of data.functions) {
    functionBase.set(fn.id, fileBaseName(fn.id, notionId(`fn:${fn.id}`)));
  }
  for (const cat of data.categories) {
    categoryBase.set(cat.id, fileBaseName(cat.name, notionId(`cat:${cat.id}`)));
  }
  for (const sub of data.subcategories) {
    subcategoryBase.set(sub.id, fileBaseName(sub.id, notionId(`sub:${sub.id}`)));
  }

  return {
    functionBase,
    categoryBase,
    subcategoryBase,
    functionsCsv: `functions ${notionId("db:functions")}`,
    categoriesCsv: `categories ${notionId("db:categories")}`,
    subcategoriesCsv: `subcategories ${notionId("db:subcategories")}`,
    findingsCsv: `findings ${notionId("db:findings")}`,
    artifactsCsv: `artifacts ${notionId("db:artifacts")}`,
    rootPage: `CSF_Wiki ${notionId("page:root")}`,
  };
}

async function emitBundle(data: SourceData, names: BundleNames): Promise<number> {
  await mkdir(join(BUNDLE_INNER, "functions"), { recursive: true });
  await mkdir(join(BUNDLE_INNER, "categories"), { recursive: true });
  await mkdir(join(BUNDLE_INNER, "subcategories"), { recursive: true });

  const writes: Promise<unknown>[] = [];
  let fileCount = 0;

  // --- Top index page --------------------------------------------------------
  const indexEntries: Array<[string, string]> = [
    ["functions", `CSF_Wiki/${names.functionsCsv}.csv`],
    ["categories", `CSF_Wiki/${names.categoriesCsv}.csv`],
    ["subcategories", `CSF_Wiki/${names.subcategoriesCsv}.csv`],
    ["findings", `CSF_Wiki/${names.findingsCsv}.csv`],
    ["artifacts", `CSF_Wiki/${names.artifactsCsv}.csv`],
  ];
  const indexMarkdown = [
    "# CSF_Wiki",
    "",
    ...indexEntries.map(([label, path]) => `[${label}](${encodePath(path)})`),
  ].join("\n\n");
  writes.push(writeFile(join(BUNDLE_DIR, `${names.rootPage}.md`), `${indexMarkdown}\n`, "utf8"));
  fileCount += 1;

  // --- functions.csv ---------------------------------------------------------
  const functionsCsvRows: CsvRow[] = [
    ["ID", "Name", "Description", "Actual Score", "Target Score", "categories", "subcategories"],
    ...data.functions.map((fn) => {
      const categoriesCell = fn.categoryIds
        .map((id) => {
          const cat = data.categories.find((c) => c.id === id);
          return relationCell(cat?.name ?? id, `categories/${names.categoryBase.get(id)}`, "csv");
        })
        .join(", ");
      const subcategoriesCell = fn.subcategoryIds
        .map((id) => relationCell(id, `subcategories/${names.subcategoryBase.get(id)}`, "csv"))
        .join(", ");
      return [fn.id, fn.name, fn.description, fn.actualScore, fn.targetScore, categoriesCell, subcategoriesCell];
    }),
  ];
  writes.push(writeFile(join(BUNDLE_INNER, `${names.functionsCsv}.csv`), writeCsvText(functionsCsvRows), "utf8"));
  fileCount += 1;

  // --- categories.csv --------------------------------------------------------
  const categoriesCsvRows: CsvRow[] = [
    ["Function", "ID", "Name", "Description", "subcategories", "Actual Score", "Target Score"],
    ...data.categories.map((cat) => {
      const functionCell = relationCell(cat.functionId, `functions/${names.functionBase.get(cat.functionId)}`, "csv");
      const subcategoriesCell = cat.subcategoryIds
        .map((id) => relationCell(id, `subcategories/${names.subcategoryBase.get(id)}`, "csv"))
        .join(", ");
      return [functionCell, cat.id, cat.name, cat.description, subcategoriesCell, cat.actualScore, cat.targetScore];
    }),
  ];
  writes.push(writeFile(join(BUNDLE_INNER, `${names.categoriesCsv}.csv`), writeCsvText(categoriesCsvRows), "utf8"));
  fileCount += 1;

  // --- subcategories.csv (extended schema) -----------------------------------
  const subcategoriesCsvRows: CsvRow[] = [
    SUBCATEGORY_COLUMNS,
    ...data.subcategories.map((sub) => {
      const categoryCell = relationCell(sub.categoryName, `categories/${names.categoryBase.get(sub.categoryId)}`, "csv");
      const functionCell = relationCell(sub.functionId, `functions/${names.functionBase.get(sub.functionId)}`, "csv");
      return subcategoryValues(sub, categoryCell, functionCell);
    }),
  ];
  writes.push(writeFile(join(BUNDLE_INNER, `${names.subcategoriesCsv}.csv`), writeCsvText(subcategoriesCsvRows), "utf8"));
  fileCount += 1;

  // --- findings.csv / artifacts.csv ------------------------------------------
  const findingsCsvRows: CsvRow[] = [FINDINGS_COLUMNS, ...data.findings.map((f) => findingValues(f))];
  const artifactsCsvRows: CsvRow[] = [ARTIFACTS_COLUMNS, ...data.artifacts.map((a) => artifactValues(a))];
  writes.push(writeFile(join(BUNDLE_INNER, `${names.findingsCsv}.csv`), writeCsvText(findingsCsvRows), "utf8"));
  writes.push(writeFile(join(BUNDLE_INNER, `${names.artifactsCsv}.csv`), writeCsvText(artifactsCsvRows), "utf8"));
  fileCount += 2;

  // --- function pages --------------------------------------------------------
  for (const fn of data.functions) {
    const categoriesProp = fn.categoryIds
      .map((id) => {
        const cat = data.categories.find((c) => c.id === id);
        return relationCell(cat?.name ?? id, `../categories/${names.categoryBase.get(id)}`, "md");
      })
      .join(", ");
    const subcategoriesProp = fn.subcategoryIds
      .map((id) => relationCell(id, `../subcategories/${names.subcategoryBase.get(id)}`, "md"))
      .join(", ");
    const page = [
      `# ${fn.id}`,
      "",
      `Name: ${fn.name}`,
      `Description: ${fn.description}`,
      `Actual Score: ${fn.actualScore}`,
      `Target Score: ${fn.targetScore}`,
      `categories: ${categoriesProp}`,
      `subcategories: ${subcategoriesProp}`,
      "",
    ].join("\n");
    writes.push(writeFile(join(BUNDLE_INNER, "functions", `${names.functionBase.get(fn.id)}.md`), page, "utf8"));
    fileCount += 1;
  }

  // --- category pages --------------------------------------------------------
  for (const cat of data.categories) {
    const functionProp = relationCell(cat.functionId, `../functions/${names.functionBase.get(cat.functionId)}`, "md");
    const subcategoriesProp = cat.subcategoryIds
      .map((id) => relationCell(id, `../subcategories/${names.subcategoryBase.get(id)}`, "md"))
      .join(", ");
    const page = [
      `# ${cat.name}`,
      "",
      `ID: ${cat.id}`,
      `Description: ${cat.description}`,
      `Function: ${functionProp}`,
      `Actual Score: ${cat.actualScore}`,
      `Target Score: ${cat.targetScore}`,
      `subcategories: ${subcategoriesProp}`,
      "",
    ].join("\n");
    writes.push(writeFile(join(BUNDLE_INNER, "categories", `${names.categoryBase.get(cat.id)}.md`), page, "utf8"));
    fileCount += 1;
  }

  // --- subcategory pages (properties + preserved implementation examples) ----
  for (const sub of data.subcategories) {
    const categoryProp = relationCell(sub.categoryName, `../categories/${names.categoryBase.get(sub.categoryId)}`, "md");
    const functionProp = relationCell(sub.functionId, `../functions/${names.functionBase.get(sub.functionId)}`, "md");
    const a = sub.assessment;
    const page = [
      `# ${sub.id}`,
      "",
      `Description: ${sub.description}`,
      `Category: ${categoryProp}`,
      `Function: ${functionProp}`,
      `Score: ${sub.score}`,
      `Target Score: ${sub.targetScore}`,
      `In Scope?: ${a.inScope}`,
      `Owner: ${a.owner}`,
      `Auditor: ${a.auditor}`,
      `NIST 800-53 Control Ref: ${a.nist80053}`,
      "",
      "## Implementation Examples",
      "",
      ...sub.examples.flatMap((example) => formatExampleLines(example)),
      "",
    ].join("\n");
    writes.push(
      writeFile(join(BUNDLE_INNER, "subcategories", `${names.subcategoryBase.get(sub.id)}.md`), page, "utf8"),
    );
    fileCount += 1;
  }

  await Promise.all(writes);
  return fileCount;
}

// ---------------------------------------------------------------------------
// README (marker-scoped generated blocks only — never clobbers curated prose)
// ---------------------------------------------------------------------------

function buildGeneratedBlocks(data: SourceData): Record<string, string> {
  const perFunction = data.functions
    .map(
      (fn) =>
        `| ${fn.id} | ${fn.name} | ${fn.categoryIds.length} | ${fn.subcategoryIds.length} | ${fn.actualScore || "—"} | ${fn.targetScore || "—"} |`,
    )
    .join("\n");

  const counts = [
    "This bundle is generated from the app source-of-truth CSV",
    "(`GET_THE_SPREADSHEETS/yyyy-mm-dd_CSF_Profile.csv`) by `_generate.ts`.",
    "",
    `- **Functions:** ${data.functions.length}`,
    `- **Categories:** ${data.categories.length}`,
    `- **Subcategories:** ${data.subcategories.length}`,
    `- **Implementation examples preserved:** ${data.exampleCount}`,
    `- **Findings:** ${data.findings.length}`,
    `- **Artifacts:** ${data.artifacts.length}`,
    "",
    "| Function | Name | Categories | Subcategories | Actual (avg) | Target (avg) |",
    "|----------|------|-----------|---------------|--------------|--------------|",
    perFunction,
  ].join("\n");

  const schema = [
    "**`subcategories.csv`** — one row per subcategory (where all scoring happens).",
    "Mirrors the app profile CSV, at the subcategory grain. Columns:",
    "",
    "`ID, Category, Function, Description, In Scope?, Owner, Stakeholders, Auditor,",
    "NIST 800-53 Control Ref, Test Procedures, Score, Target Score,",
    "Q1–Q4 {Actual Score, Target Score, Observations, Observation Date, Testing Status,",
    "Examine, Interview, Test}, Remediation Owner, Remediation Due Date, Minimum Target,",
    "Action Plan, Artifact Name`",
    "",
    "- `Category` → relation to `categories.csv`; `Function` → denormalized filter column.",
    "- `Score` / `Target Score` are the latest populated quarter (the value Notion rolls up).",
    "- The four quarterly blocks give the time dimension for quarterly GRC snapshots.",
    "- Subcategory-level assessment values are taken from each subcategory's **primary",
    "  implementation example (Ex1)**; every implementation example is preserved verbatim",
    "  on the subcategory page body.",
    "",
    "**`findings.csv`** — mirrors `JIRA-Findings.csv`. Columns:",
    "",
    "`Summary, Subcategory ID, Issue Key, Issue Type, Status, Priority, Assignee, Reporter,",
    "Created, Updated, Due Date, Root Cause, Vulnerability, Remediation Action Plan,",
    "Testing Status, Description`",
    "",
    "**`artifacts.csv`** — mirrors `JIRA-Artifacts.csv`. Columns:",
    "",
    "`Summary, Subcategory ID, Issue Key, Issue Type, Status, Priority, Assignee, Reporter,",
    "Created, Updated, Link, Description`",
    "",
    "`Subcategory ID` on Findings and Artifacts is a **relation-ready** column: convert it",
    "to a Notion Relation targeting the Subcategories database to link every finding and",
    "artifact back to the subcategory it evidences. It is pre-populated wherever a",
    "subcategory ID (e.g. `PR.IR-01`) appears in the source finding/artifact text.",
  ].join("\n");

  const bundleTree = [
    "```",
    "README.md            this file (curated prose; generated blocks between markers)",
    "functions.csv        6 rows  — Functions database (loose CSV path)",
    "categories.csv       22 rows — Categories database (relation → Functions)",
    "subcategories.csv    106 rows — Subcategories database (extended GRC schema)",
    "findings.csv         Findings database (relation-ready → Subcategories)",
    "artifacts.csv        Artifacts database (relation-ready → Subcategories)",
    "subcategories/       106 markdown pages (frontmatter + quarterly assessment + examples)",
    "CSF_Wiki/            Notion drag-import bundle (Markdown & CSV export layout):",
    "                     ├── CSF_Wiki [id].md          top index page",
    "                     └── CSF_Wiki/",
    "                         ├── functions [id].csv     6 rows + rollup snapshot",
    "                         ├── categories [id].csv    22 rows + rollup snapshot",
    "                         ├── subcategories [id].csv 106 rows, extended schema",
    "                         ├── findings [id].csv      Findings database",
    "                         ├── artifacts [id].csv     Artifacts database",
    "                         ├── functions/     6 pages",
    "                         ├── categories/    22 pages",
    "                         └── subcategories/ 106 pages (with implementation examples)",
    "_generate.ts         re-runnable Bun generator (idempotent)",
    "```",
  ].join("\n");

  return { counts, schema, "bundle-tree": bundleTree };
}

async function updateReadme(data: SourceData): Promise<string[]> {
  if (!existsSync(README_PATH)) {
    throw new Error(
      `README.md not found at ${README_PATH}. Author it with BEGIN/END GENERATED markers first.`,
    );
  }
  const original = await readFile(README_PATH, "utf8");
  const blocks = buildGeneratedBlocks(data);
  let updated = original;
  const missing: string[] = [];

  for (const [name, content] of Object.entries(blocks)) {
    const begin = `<!-- BEGIN GENERATED: ${name} -->`;
    const end = `<!-- END GENERATED: ${name} -->`;
    const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`${escape(begin)}[\\s\\S]*?${escape(end)}`);
    if (!pattern.test(updated)) {
      missing.push(name);
      continue;
    }
    updated = updated.replace(pattern, `${begin}\n${content}\n${end}`);
  }

  if (updated !== original) {
    await writeFile(README_PATH, updated, "utf8");
  }
  return missing;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

async function cleanDerivedOutputs(): Promise<void> {
  await rm(BUNDLE_DIR, { recursive: true, force: true });
  await rm(SUBCATEGORIES_DIR, { recursive: true, force: true });
}

const data = await loadSource();
await cleanDerivedOutputs();
const looseCount = await emitLooseFiles(data);
const bundleNames = buildBundleNames(data);
const bundleCount = await emitBundle(data, bundleNames);
const missingMarkers = await updateReadme(data);

if (missingMarkers.length > 0) {
  console.warn(
    `WARN: README missing GENERATED markers (left untouched): ${missingMarkers.join(", ")}`,
  );
}

console.log(
  [
    `Source: ${SOURCE_CSV_PATH}`,
    `Functions: ${data.functions.length}`,
    `Categories: ${data.categories.length}`,
    `Subcategories: ${data.subcategories.length}`,
    `Implementation examples: ${data.exampleCount}`,
    `Findings: ${data.findings.length}`,
    `Artifacts: ${data.artifacts.length}`,
    `Loose files written: ${looseCount}`,
    `Bundle files written: ${bundleCount}`,
    `Subcategory pages in CSF_Wiki bundle: ${data.subcategories.length}`,
  ].join("\n"),
);
