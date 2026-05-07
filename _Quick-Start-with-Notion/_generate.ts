import { readdir } from "node:fs/promises";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const OUTPUT_DIR = import.meta.dir;
const SOURCE_CSV_PATH =
  Bun.argv[2] ??
  process.env.CSF_SOURCE_CSV ??
  join(OUTPUT_DIR, "source", "CSF-implementation-examples.csv");
const SUBCATEGORIES_DIR = join(OUTPUT_DIR, "subcategories");
const EXPECTED_SOURCE_HEADER = [
  "ID",
  "Function",
  "Function Description",
  "Category ID",
  "Category",
  "Category Description",
  "Subcategory ID",
  "Subcategory Description",
  "Implementation Example",
] as const;

type CsvRow = string[];

interface FunctionRow {
  id: string;
  name: string;
  description: string;
}

interface CategoryRow {
  id: string;
  name: string;
  description: string;
  functionId: string;
}

interface ExampleRow {
  id: string;
  text: string;
}

interface SubcategoryRow {
  id: string;
  description: string;
  categoryId: string;
  categoryName: string;
  functionId: string;
  functionName: string;
  owner: string;
  targetScore: string;
  score: string;
  lastReviewed: string;
  observations: string;
  evidence: string;
  notes: string;
  examples: ExampleRow[];
}

interface SourceData {
  functions: FunctionRow[];
  categories: CategoryRow[];
  subcategories: SubcategoryRow[];
  exampleCount: number;
}

interface FunctionIdParts {
  shortId: string;
  longName: string;
}

function parseCsv(source: string): CsvRow[] {
  // RFC 4180 parser using a character-walk state machine so quoted commas,
  // doubled quotes, and embedded newlines stay inside their originating field.
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
      if (field.length > 0) {
        throw new Error(
          `Malformed CSV: unexpected quote inside unquoted field near character ${index}.`,
        );
      }

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

function writeCsv(rows: CsvRow[]): string {
  return rows
    .map((row: CsvRow) => row.map((value: string) => quoteCsvField(value)).join(","))
    .join("\n");
}

function extractFunctionId(value: string): FunctionIdParts {
  const match = /^(.+?)\s*\(([A-Z]{2})\)\s*$/.exec(value);

  if (!match) {
    throw new Error(
      `Invalid Function value "${value}". Expected format like "GOVERN (GV)".`,
    );
  }

  return {
    shortId: match[2],
    longName: match[1].trim(),
  };
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

function escapeYamlString(value: string): string {
  if (value.length === 0) {
    return "";
  }

  const needsQuotes =
    /^[\s]/.test(value) || value.includes(":") || /[\[\]"']/.test(value);

  if (!needsQuotes) {
    return value;
  }

  return `'${value.replaceAll("'", "''")}'`;
}

function renderYamlField(key: string, value: string): string {
  return value.length === 0 ? `${key}:` : `${key}: ${escapeYamlString(value)}`;
}

function formatImplementationExample(example: ExampleRow): string {
  const trimmed = example.text.trim();
  const match = /^(Ex\d+):\s*(.*)$/.exec(trimmed);

  if (!match) {
    return `- ${trimmed}`;
  }

  return `- **${match[1]}:** ${match[2]}`;
}

function buildSubcategoryMarkdown(subcategory: SubcategoryRow): string {
  const lines = [
    "---",
    renderYamlField("id", subcategory.id),
    renderYamlField("function_id", subcategory.functionId),
    renderYamlField("function_name", subcategory.functionName),
    renderYamlField("category_id", subcategory.categoryId),
    renderYamlField("category_name", subcategory.categoryName),
    "score:",
    "target_score:",
    "owner:",
    "last_reviewed:",
    "---",
    "",
    `# ${subcategory.id} — ${subcategory.description}`,
    "",
    "## Description",
    "",
    subcategory.description,
    "",
    "## Implementation Examples",
    "",
    ...subcategory.examples.map((example: ExampleRow) =>
      formatImplementationExample(example),
    ),
    "",
    "## Notes",
    "",
    "_Add scoring rationale, decisions, and context here._",
    "",
    "## Observations",
    "",
    "_Add observed evidence, anomalies, gaps, or behaviors here._",
    "",
    "## Evidence",
    "",
    "_List artifacts, links, screenshots, ticket IDs, attestations supporting this score._",
    "",
  ];

  return lines.join("\n");
}

function buildReadme(data: SourceData): string {
  return `# Cybersecurity Framework Quickstart — NIST CSF Maturity Wiki

A drop-in Notion workspace for assessing maturity against the NIST Cybersecurity Framework. Preserves the full 6 → 22 → 106 hierarchy. You score at the subcategory level; Notion rolls scores up to category and function automatically. Designed as preparation work — when you migrate to a dedicated GRC platform, your enriched subcategory CSV is the single artifact you need.

## Who this is for

GRC practitioners, security teams, and consultants who want to start a CSF assessment **today** without waiting on tool procurement. You want notes, observations, owners, and evidence captured against every subcategory; live category- and function-level rollups as you score; and a clean export when the GRC platform is ready.

## What you get

\`\`\`
README.md            this file
functions.csv        6 rows  — Functions database
categories.csv       22 rows — Categories database (relation → Functions)
subcategories.csv    106 rows — Subcategories database (relation → Categories)
                                where all scoring happens
subcategories/       106 markdown pages, one per subcategory:
                     ├── frontmatter (id, function/category names, score,
                     │                target_score, owner, last_reviewed)
                     └── body (Description / Implementation Examples /
                              Notes / Observations / Evidence)
_generate.ts         re-runnable Bun TypeScript generator
\`\`\`

## Scoring rubric (CMMI-style 0.0–5.0)

- \`0.0\` Non-existent — control does not exist
- \`1.0\` Initial — ad-hoc, undocumented
- \`2.0\` Repeatable — informal patterns, partial documentation
- \`3.0\` Defined — documented, communicated, consistently applied
- \`4.0\` Managed — measured, reviewed, evidence-driven
- \`5.0\` Optimized — continuously improved, proactive

Intermediate values (e.g. \`3.5\`) express partial progression. This is a defensible default; swap it for a CSF-Tier-aligned scale (1 Partial / 2 Risk-Informed / 3 Repeatable / 4 Adaptive), CMMI-DEV, COBIT capability levels, or any organization-specific scale by editing this section — the database schema is rubric-agnostic.

## How aggregation works

**TL;DR — you only ever enter a number in one place: the \`Score\` field on a Subcategory page.** The 22 Category averages and 6 Function averages are computed by Notion automatically via Rollup properties. You never average by hand.

### The data flow

\`\`\`
   You score a Subcategory  (0.0–5.0)
              │
              ▼
   Each Category has a Rollup that says:
      "Average the Score field across all Subcategories that point at me"
              │
              ▼
   Each Function has a Rollup that says:
      "Average the rollup across all Categories that point at me"
\`\`\`

Scores flow up; nothing flows down. The 22 Categories don't have their own \`Score\` field — only a Rollup of their child Subcategories. The 6 Functions don't have a \`Score\` field either — only a Rollup of their child Categories.

### Why three linked databases (not one)

| Database | Rows | Has \`Score\` field? | Has Rollup? |
|----------|------|---------------------|-------------|
| Functions | 6 | no | yes — averages this Function's Categories' rollups |
| Categories | 22 | no | yes — averages this Category's Subcategories' Scores |
| Subcategories | 106 | **yes — you type it here** | no |

Notion's Rollup property only works across **explicit Relations between databases** — it can't aggregate inside a single database. That's why this wiki ships as three databases linked by relations, not one giant 106-row table with Function and Category columns. Three databases gives you working rollups for free; one table doesn't.

### Worked example — GV (GOVERN)

The Function **GOVERN (GV)** has 6 Categories. One of them is **GV.SC — Cybersecurity Supply Chain Risk Management**, which contains 10 Subcategories (GV.SC-01 through GV.SC-10).

Imagine you score 4 of those 10 Subcategories so far:

| Subcategory | Score |
|-------------|-------|
| GV.SC-01 | 4.0 |
| GV.SC-02 | 3.0 |
| GV.SC-03 | 2.5 |
| GV.SC-04 | 3.5 |
| GV.SC-05..10 | (empty — not yet scored) |

**Category-level rollup (GV.SC):** Notion averages the 4 entered Scores (empty rows are skipped):

\`(4.0 + 3.0 + 2.5 + 3.5) ÷ 4 = 3.25\`

The \`GV.SC\` row in your Categories database displays **3.25**.

**Function-level rollup (GV):** assume your other 5 Categories under GV show rollups of \`2.0, 4.0, 3.0, 2.5, 3.5\`. The Function-level rollup averages those 6 Category rollups (including GV.SC's 3.25):

\`(3.25 + 2.0 + 4.0 + 3.0 + 2.5 + 3.5) ÷ 6 = 3.04\`

The \`GV\` row in your Functions database displays **3.04**.

Score one more Subcategory under GV.SC and the GV.SC rollup recomputes; that ripples up to the GV rollup automatically — no formulas, no manual refresh.

### How partial scoring is handled

Notion's \`Rollup → Average\` **ignores empty values**. So if you've only scored 30 of 106 Subcategories, the rollups reflect those 30 — they aren't dragged toward zero by the unscored rows. A half-finished assessment doesn't lie; it just shows you a partial picture you know is partial.

**If you want empty Subcategories to count as 0** (treating "not scored" as "non-existent"), use this approach instead:

- Add a Formula property called \`EffectiveScore\`: \`if(empty(prop("Score")), 0, prop("Score"))\`
- Configure the Category-level Rollup to roll up \`EffectiveScore\` instead of \`Score\`

That way unscored rows contribute 0 to the average, and your rollups punish coverage gaps.

### Why average Categories first (not all Subcategories directly)

You could skip the Category layer and have each Function rollup average all of its Subcategory scores directly. That is **not** what this wiki does, and here's why:

- **Equal weight per domain.** CSF Categories are organizational domains, and risk officers usually treat them as equal weight. **GV.SC** has 10 Subcategories; **GV.OV** (Oversight) has 3. If a Function rollup averaged all subcategories directly, big categories would drown out small ones — a 10-Subcategory category would carry over 3× the weight of a 3-Subcategory category in the Function score. The two-stage design (Subcategories → Category average → Function average of Category averages) treats every Category as one equal domain.
- **Faster feedback loop.** People work through one Category at a time. Seeing the Category rollup update as you score keeps the assessment moving. The Function rollup then tells the higher-altitude story.

If you prefer **equal weight per Subcategory** (so big categories dominate the Function score), set up a single rollup on Functions that traverses through Categories down to Subcategories using Notion's nested rollup. That's a different aggregation philosophy — pick one and document it.

### Adding a gap view

The \`Target Score\` column on each Subcategory is your aspirational maturity. To surface the gap visually:

1. Add a Formula property on Subcategories: \`Gap = Target Score - Score\`
2. Sort or color-code your Subcategory views by \`Gap\` to see the biggest deficits first
3. (Optional) Add a Category-level rollup of \`Average(Target Score)\` so each Category shows current maturity, target maturity, and the gap between them — that gives you a per-domain investment-priority list

## Notion import — step by step

1. Create a Notion page named **CSF Wiki** (or whatever you prefer).
2. Drag \`functions.csv\`, \`categories.csv\`, and \`subcategories.csv\` onto the page (or use **Import → CSV**) — each becomes its own inline database. Notion uses the first column as the database title, so each database's title column will be \`ID\` (\`GV\`, \`GV.SC\`, \`GV.SC-04\`, etc.).
3. Convert the relation columns:
   - Open the **Categories** database. Find the \`Function\` column (currently text). Click the column header → **Edit property** → change type to **Relation** with target = the Functions database. Notion offers to auto-link rows whose \`Function\` text value matches a Function \`ID\` — accept.
   - Repeat for the **Subcategories** database: convert the \`Category\` column from text to Relation → Categories.
4. Add the rollups:
   - On **Categories**, add a new property of type **Rollup**. Source = the Subcategories relation. Property = \`Score\`. Calculate = \`Average\`. Format → 1 decimal place.
   - On **Functions**, add a new property of type **Rollup**. Source = the Categories relation. Property = the Category rollup you just created. Calculate = \`Average\`. Format → 1 decimal place.
5. Bulk-paste each \`subcategories/{ID}.md\` into the matching Subcategory page body. Two routes:
   - **Manual:** open a Subcategory page and paste the file body — Notion converts markdown on paste.
   - **Bulk:** Notion's **Import → Markdown & CSV** can ingest the whole \`subcategories/\` directory in one shot, then merge each markdown page into the matching database row by ID.
6. Pin a top-level page view that shows the Functions database with its rollup column visible. That's your dashboard.

After step 4 your rollups are live. Score a single Subcategory and watch the Category and Function rollups update.

## Schema

\`functions.csv\` — \`ID, Name, Description\`

\`categories.csv\` — \`ID, Name, Description, Function\`
- \`Function\` references \`functions.csv ID\` for the Notion relation

\`subcategories.csv\` — \`ID, Description, Category, Function, Owner, Target Score, Score, Last Reviewed, Observations, Evidence, Notes\`
- \`Category\` references \`categories.csv ID\` for the Notion relation
- \`Function\` is a denormalized convenience column (\`GV\`, \`ID\`, \`PR\`, \`DE\`, \`RS\`, \`RC\`) — keep it as plain Text for fast filtering by Function without traversing the Category relation. You don't need to convert it to a Notion Relation; the Subcategories → Categories → Functions chain already gives you rollup math via that relation.
- \`Owner\`, \`Target Score\`, \`Score\`, \`Last Reviewed\`, \`Observations\`, \`Evidence\`, \`Notes\` ship empty — fill them in as you assess

## GRC migration path

\`subcategories.csv\` exported back out of Notion — now enriched with Score, Target Score, Owner, Last Reviewed, Observations, Evidence, and Notes — is the single artifact to feed into your GRC platform (Archer, Hyperproof, OneTrust, ServiceNow GRC, MetricStream, etc.). Most GRC tools import CSV directly or via a vendor template into which you can map columns 1:1.

The Functions and Categories databases are browsing scaffolding for the Notion stage. Discard them at migration — your GRC tool's CSF taxonomy module already provides them.

## Source data and regeneration

This bundle was generated from a NIST CSF implementation-examples CSV via \`_generate.ts\`. Counts written: ${data.functions.length} functions, ${data.categories.length} categories, ${data.subcategories.length} subcategories, ${data.exampleCount} implementation examples preserved verbatim on subcategory pages.

To regenerate against an updated source CSV:

\`\`\`sh
# explicit path
bun run _generate.ts /path/to/CSF-implementation-examples.csv

# or via env var
CSF_SOURCE_CSV=/path/to/CSF-implementation-examples.csv bun run _generate.ts

# or fall back to the bundled source/CSF-implementation-examples.csv
bun run _generate.ts
\`\`\`

The generator is idempotent — it cleans the \`subcategories/\` directory and overwrites all CSVs and this README on every run.

## What this wiki deliberately does NOT do

- **Score implementation examples.** Examples are read-only NIST reference text, surfaced on each Subcategory page for context — not their own database rows or pages.
- **Auto-aggregate scores in CSV.** Aggregation is Notion's job, done via Rollup properties on the relations.
- **Prescribe the "right" rubric.** The default CMMI-style 0–5 scale is a defensible starting point; pick your organization's calibration and edit the rubric section accordingly.
`;
}

function ensureHeader(header: CsvRow): void {
  if (header.length !== EXPECTED_SOURCE_HEADER.length) {
    throw new Error(
      `Unexpected source header width: expected ${EXPECTED_SOURCE_HEADER.length} columns but found ${header.length}.`,
    );
  }

  for (let index = 0; index < EXPECTED_SOURCE_HEADER.length; index += 1) {
    if (header[index] !== EXPECTED_SOURCE_HEADER[index]) {
      throw new Error(
        `Unexpected source header at column ${index + 1}: expected "${EXPECTED_SOURCE_HEADER[index]}", found "${header[index]}".`,
      );
    }
  }
}

function ensureMatchingFunction(
  functionsById: Map<string, FunctionRow>,
  nextValue: FunctionRow,
): void {
  const existing = functionsById.get(nextValue.id);

  if (!existing) {
    functionsById.set(nextValue.id, nextValue);
    return;
  }

  if (
    existing.name !== nextValue.name ||
    existing.description !== nextValue.description
  ) {
    throw new Error(
      `Conflicting function data for "${nextValue.id}". Check the source CSV for inconsistent Function rows.`,
    );
  }
}

function ensureMatchingCategory(
  categoriesById: Map<string, CategoryRow>,
  nextValue: CategoryRow,
): void {
  const existing = categoriesById.get(nextValue.id);

  if (!existing) {
    categoriesById.set(nextValue.id, nextValue);
    return;
  }

  if (
    existing.name !== nextValue.name ||
    existing.description !== nextValue.description ||
    existing.functionId !== nextValue.functionId
  ) {
    throw new Error(
      `Conflicting category data for "${nextValue.id}". Check the source CSV for inconsistent Category rows.`,
    );
  }
}

function ensureMatchingSubcategory(
  subcategoriesById: Map<string, SubcategoryRow>,
  nextValue: SubcategoryRow,
): void {
  const existing = subcategoriesById.get(nextValue.id);

  if (!existing) {
    subcategoriesById.set(nextValue.id, nextValue);
    return;
  }

  if (
    existing.description !== nextValue.description ||
    existing.categoryId !== nextValue.categoryId ||
    existing.categoryName !== nextValue.categoryName ||
    existing.functionId !== nextValue.functionId ||
    existing.functionName !== nextValue.functionName
  ) {
    throw new Error(
      `Conflicting subcategory data for "${nextValue.id}". Check the source CSV for inconsistent Subcategory rows.`,
    );
  }
}

function validateCounts(data: SourceData): void {
  if (data.functions.length !== 6) {
    throw new Error(
      `Validation failed: expected 6 functions but found ${data.functions.length}. Verify column 2 values in ${SOURCE_CSV_PATH}.`,
    );
  }

  if (data.categories.length !== 22) {
    throw new Error(
      `Validation failed: expected 22 categories but found ${data.categories.length}. Verify column 4 values in ${SOURCE_CSV_PATH}.`,
    );
  }

  if (data.subcategories.length !== 106) {
    throw new Error(
      `Validation failed: expected 106 subcategories but found ${data.subcategories.length}. Verify column 7 values in ${SOURCE_CSV_PATH}.`,
    );
  }
}

async function loadSource(): Promise<SourceData> {
  const sourceText = await readFile(SOURCE_CSV_PATH, "utf8");
  const rows = parseCsv(sourceText);

  if (rows.length === 0) {
    throw new Error(`Source CSV is empty: ${SOURCE_CSV_PATH}`);
  }

  const header = rows[0];

  if (!header) {
    throw new Error(`Source CSV is empty: ${SOURCE_CSV_PATH}`);
  }

  const dataRows = rows.slice(1);
  ensureHeader(header);

  const functionsById = new Map<string, FunctionRow>();
  const categoriesById = new Map<string, CategoryRow>();
  const subcategoriesById = new Map<string, SubcategoryRow>();
  let exampleCount = 0;

  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
    const row = dataRows[rowIndex];

    if (row.length !== 9) {
      throw new Error(
        `Invalid source row ${rowIndex + 2}: expected 9 columns but found ${row.length}.`,
      );
    }

    const [
      exampleId,
      functionCell,
      functionDescription,
      categoryId,
      categoryCell,
      categoryDescription,
      subcategoryId,
      subcategoryDescription,
      implementationExample,
    ] = row;

    const functionParts = extractFunctionId(functionCell);
    const categoryName = stripCategorySuffix(categoryCell);

    ensureMatchingFunction(functionsById, {
      id: functionParts.shortId,
      name: functionParts.longName,
      description: functionDescription,
    });

    ensureMatchingCategory(categoriesById, {
      id: categoryId,
      name: categoryName,
      description: categoryDescription,
      functionId: functionParts.shortId,
    });

    ensureMatchingSubcategory(subcategoriesById, {
      id: subcategoryId,
      description: subcategoryDescription,
      categoryId,
      categoryName,
      functionId: functionParts.shortId,
      functionName: functionParts.longName,
      owner: "",
      targetScore: "",
      score: "",
      lastReviewed: "",
      observations: "",
      evidence: "",
      notes: "",
      examples: [],
    });

    const subcategory = subcategoriesById.get(subcategoryId);

    if (!subcategory) {
      throw new Error(`Failed to materialize subcategory "${subcategoryId}".`);
    }

    subcategory.examples.push({
      id: exampleId,
      text: implementationExample,
    });
    exampleCount += 1;
  }

  const functions = [...functionsById.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const categories = [...categoriesById.values()].sort((left, right) =>
    left.id.localeCompare(right.id),
  );
  const subcategories = [...subcategoriesById.values()]
    .map((subcategory: SubcategoryRow) => ({
      ...subcategory,
      examples: [...subcategory.examples].sort((left, right) =>
        left.id.localeCompare(right.id, undefined, { numeric: true }),
      ),
    }))
    .sort((left, right) => left.id.localeCompare(right.id));

  const data: SourceData = {
    functions,
    categories,
    subcategories,
    exampleCount,
  };

  validateCounts(data);
  return data;
}

async function cleanSubcategoryDir(): Promise<void> {
  await mkdir(SUBCATEGORIES_DIR, { recursive: true });
  const entries = await readdir(SUBCATEGORIES_DIR, { withFileTypes: true });

  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => rm(join(SUBCATEGORIES_DIR, entry.name))),
  );
}

async function emitBundle(data: SourceData): Promise<number> {
  await cleanSubcategoryDir();

  const functionsCsvRows: CsvRow[] = [
    ["ID", "Name", "Description"],
    ...data.functions.map((row: FunctionRow) => [
      row.id,
      row.name,
      row.description,
    ]),
  ];

  const categoriesCsvRows: CsvRow[] = [
    ["ID", "Name", "Description", "Function"],
    ...data.categories.map((row: CategoryRow) => [
      row.id,
      row.name,
      row.description,
      row.functionId,
    ]),
  ];

  const subcategoriesCsvRows: CsvRow[] = [
    [
      "ID",
      "Description",
      "Category",
      "Function",
      "Owner",
      "Target Score",
      "Score",
      "Last Reviewed",
      "Observations",
      "Evidence",
      "Notes",
    ],
    ...data.subcategories.map((row: SubcategoryRow) => [
      row.id,
      row.description,
      row.categoryId,
      row.functionId,
      row.owner,
      row.targetScore,
      row.score,
      row.lastReviewed,
      row.observations,
      row.evidence,
      row.notes,
    ]),
  ];

  const writes: Promise<void>[] = [
    writeFile(join(OUTPUT_DIR, "functions.csv"), writeCsv(functionsCsvRows), "utf8"),
    writeFile(
      join(OUTPUT_DIR, "categories.csv"),
      writeCsv(categoriesCsvRows),
      "utf8",
    ),
    writeFile(
      join(OUTPUT_DIR, "subcategories.csv"),
      writeCsv(subcategoriesCsvRows),
      "utf8",
    ),
    writeFile(join(OUTPUT_DIR, "README.md"), buildReadme(data), "utf8"),
    ...data.subcategories.map((subcategory: SubcategoryRow) =>
      writeFile(
        join(SUBCATEGORIES_DIR, `${subcategory.id}.md`),
        buildSubcategoryMarkdown(subcategory),
        "utf8",
      ),
    ),
  ];

  await Promise.all(writes);

  return 3 + 1 + data.subcategories.length;
}

const data = await loadSource();
const totalFilesWritten = await emitBundle(data);

console.log(
  [
    `Functions written: ${data.functions.length}`,
    `Categories written: ${data.categories.length}`,
    `Subcategories written: ${data.subcategories.length}`,
    `Implementation examples written: ${data.exampleCount}`,
    `Total files written: ${totalFilesWritten}`,
    `Output path: ${OUTPUT_DIR}`,
  ].join("\n"),
);
