# Cybersecurity Framework Quickstart — NIST CSF Maturity Wiki

A drop-in Notion workspace for assessing maturity against the NIST Cybersecurity Framework. Preserves the full 6 → 22 → 106 hierarchy. You score at the subcategory level; Notion rolls scores up to category and function automatically. Designed as preparation work — when you migrate to a dedicated GRC platform, your enriched subcategory CSV is the single artifact you need.

## Who this is for

GRC practitioners, security teams, and consultants who want to start a CSF assessment **today** without waiting on tool procurement. You want notes, observations, owners, and evidence captured against every subcategory; live category- and function-level rollups as you score; quarterly snapshots for real audit cadence; and a clean export when the GRC platform is ready.

## Zero-setup start — duplicate the hosted template

<!-- HOSTED-TEMPLATE-LINK: replace the placeholder below once the template is published (see "Publishing the hosted template" at the bottom of this README). -->
> **Hosted template:** _coming soon_ — a public notion.site link you can **Duplicate** into your own workspace in one click, no file import and no relation rebuilding. Until it's live, use the drag-import path below (5 minutes).

## Fastest start — drag the `CSF_Wiki/` folder into Notion

**Recommended for most users.** The [`CSF_Wiki/`](CSF_Wiki/) folder in this directory is a ready-to-import Notion wiki bundle. It already has the linked databases (Functions, Categories, Subcategories, plus Findings and Artifacts), all 106 subcategory pages, and the cross-database relations wired up. It ships pre-populated with the **Alma Security reference dataset** — real Q1–Q4 scores, observations, owners, and evidence — so the rollups and quarterly views demonstrate themselves out of the box. Clear that data before you start your own assessment.

1. Download or clone this repo.
2. In Notion, open the page you want the wiki to live under.
3. Type `/` → **Import** → **Markdown & CSV** → pick **`CSF_Wiki/`** from this directory (select the folder; Notion ingests the bundle).
4. Wait for Notion to finish processing — relations and rollups should appear restored.
5. Clear the reference data: open the `subcategories` database → bulk-select the Score / Q1–Q4 columns → delete, or start from your own export.

### Post-import verification checklist

Notion's folder import is convenient but not fully reliable — relation columns are the known failure point (see the warning in the manual-rebuild section). Run through this 2-minute checklist **immediately after import**, before you touch any data:

- [ ] **Page count** — the wiki index page lists 5 databases: `functions`, `categories`, `subcategories`, `findings`, `artifacts`.
- [ ] **Row counts** — Functions has **6** rows, Categories **22**, Subcategories **106**. A short table means the import truncated; delete the page and re-import.
- [ ] **Relations survived** — open **Categories** and scroll all 22 rows: every `Function` cell is non-empty. Open 3 random **Subcategories** rows: every `Category` cell is non-empty. *Empty relation cells = the known relation-wipe failure* — go to the **Recovery path** section below (about 15 minutes) instead of re-typing by hand.
- [ ] **Rollups compute** — the Categories database shows a numeric rollup (e.g. `GV.SC` around `5.5` with the reference data). If the rollup column shows `Count` or is missing, re-wire it per manual-rebuild step 4.
- [ ] **Page bodies landed** — open one subcategory page (e.g. `GV.SC-04`): it has the quarterly assessment table and its implementation examples in the body, not just properties.
- [ ] **Score fields are numbers** — click the `Score` column header on Subcategories: type shows **Number**, not Text. Rollups silently degrade to Count on text fields.

All boxes ticked → clear the Alma Security reference data and start scoring. Any box failed → the Recovery path and manual-rebuild steps below fix each case without a full restart.

If anything looks off after import (empty relation cells, missing rollups), follow the manual rebuild instructions further down this README — those steps work against the loose CSVs in this folder.

## What's in this folder

<!-- BEGIN GENERATED: bundle-tree -->
```
README.md            this file (curated prose; generated blocks between markers)
functions.csv        6 rows  — Functions database (loose CSV path)
categories.csv       22 rows — Categories database (relation → Functions)
subcategories.csv    106 rows — Subcategories database (extended GRC schema)
findings.csv         Findings database (relation-ready → Subcategories)
artifacts.csv        Artifacts database (relation-ready → Subcategories)
subcategories/       106 markdown pages (frontmatter + quarterly assessment + examples)
CSF_Wiki/            Notion drag-import bundle (Markdown & CSV export layout):
                     ├── CSF_Wiki [id].md          top index page
                     └── CSF_Wiki/
                         ├── functions [id].csv     6 rows + rollup snapshot
                         ├── categories [id].csv    22 rows + rollup snapshot
                         ├── subcategories [id].csv 106 rows, extended schema
                         ├── findings [id].csv      Findings database
                         ├── artifacts [id].csv     Artifacts database
                         ├── functions/     6 pages
                         ├── categories/    22 pages
                         └── subcategories/ 106 pages (with implementation examples)
_generate.ts         re-runnable Bun generator (idempotent)
```
<!-- END GENERATED: bundle-tree -->

The `CSF_Wiki/` bundle is the simplest path. The loose CSVs + `subcategories/` markdown pages are for users who want to regenerate the bundle from source, embed the implementation-examples body into each page manually, or pipe the data into a different tool entirely.

## Scoring rubric (CMMI-style 0.0–5.0)

- `0.0` Non-existent — control does not exist
- `1.0` Initial — ad-hoc, undocumented
- `2.0` Repeatable — informal patterns, partial documentation
- `3.0` Defined — documented, communicated, consistently applied
- `4.0` Managed — measured, reviewed, evidence-driven
- `5.0` Optimized — continuously improved, proactive

Intermediate values (e.g. `3.5`) express partial progression. This is a defensible default; swap it for a CSF-Tier-aligned scale (1 Partial / 2 Risk-Informed / 3 Repeatable / 4 Adaptive), CMMI-DEV, COBIT capability levels, or any organization-specific scale by editing this section — the database schema is rubric-agnostic.

## How aggregation works

**TL;DR — you only ever enter a number in one place: the `Score` field on a Subcategory page.** The 22 Category averages and 6 Function averages are computed by Notion automatically via Rollup properties. You never average by hand. The four quarterly columns (`Q1`–`Q4 Actual Score`) hold the time dimension; `Score` is the current (latest populated) quarter that the rollups aggregate.

### The data flow

```
   You score a Subcategory  (0.0–5.0)
              │
              ▼
   Each Category has a Rollup that says:
      "Average the Score field across all Subcategories that point at me"
              │
              ▼
   Each Function has a Rollup that says:
      "Average the rollup across all Categories that point at me"
```

Scores flow up; nothing flows down. The 22 Categories don't have their own `Score` field — only a Rollup of their child Subcategories. The 6 Functions don't have a `Score` field either — only a Rollup of their child Categories. (The bundle ships a static `Actual Score` snapshot on Categories and Functions so the imported demo is populated immediately; Notion recomputes it live once you wire the rollups.)

### Why three linked databases (not one)

| Database | Rows | Has `Score` field? | Has Rollup? |
|----------|------|---------------------|-------------|
| Functions | 6 | no | yes — averages this Function's Categories' rollups |
| Categories | 22 | no | yes — averages this Category's Subcategories' Scores |
| Subcategories | 106 | **yes — you type it here** | no |

Notion's Rollup property only works across **explicit Relations between databases** — it can't aggregate inside a single database. That's why this wiki ships as three databases linked by relations, not one giant 106-row table with Function and Category columns. Three databases gives you working rollups for free; one table doesn't. Findings and Artifacts are two further databases that relate back to Subcategories (see Schema).

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

`(4.0 + 3.0 + 2.5 + 3.5) ÷ 4 = 3.25`

The `GV.SC` row in your Categories database displays **3.25**.

**Function-level rollup (GV):** assume your other 5 Categories under GV show rollups of `2.0, 4.0, 3.0, 2.5, 3.5`. The Function-level rollup averages those 6 Category rollups (including GV.SC's 3.25):

`(3.25 + 2.0 + 4.0 + 3.0 + 2.5 + 3.5) ÷ 6 = 3.04`

The `GV` row in your Functions database displays **3.04**.

Score one more Subcategory under GV.SC and the GV.SC rollup recomputes; that ripples up to the GV rollup automatically — no formulas, no manual refresh.

### How partial scoring is handled

Notion's `Rollup → Average` **ignores empty values**. So if you've only scored 30 of 106 Subcategories, the rollups reflect those 30 — they aren't dragged toward zero by the unscored rows. A half-finished assessment doesn't lie; it just shows you a partial picture you know is partial.

**If you want empty Subcategories to count as 0** (treating "not scored" as "non-existent"), use this approach instead:

- Add a Formula property called `EffectiveScore`: `if(empty(prop("Score")), 0, prop("Score"))`
- Configure the Category-level Rollup to roll up `EffectiveScore` instead of `Score`

That way unscored rows contribute 0 to the average, and your rollups punish coverage gaps.

### Why average Categories first (not all Subcategories directly)

You could skip the Category layer and have each Function rollup average all of its Subcategory scores directly. That is **not** what this wiki does, and here's why:

- **Equal weight per domain.** CSF Categories are organizational domains, and risk officers usually treat them as equal weight. **GV.SC** has 10 Subcategories; **GV.OV** (Oversight) has 3. If a Function rollup averaged all subcategories directly, big categories would drown out small ones — a 10-Subcategory category would carry over 3× the weight of a 3-Subcategory category in the Function score. The two-stage design (Subcategories → Category average → Function average of Category averages) treats every Category as one equal domain.
- **Faster feedback loop.** People work through one Category at a time. Seeing the Category rollup update as you score keeps the assessment moving. The Function rollup then tells the higher-altitude story.

If you prefer **equal weight per Subcategory** (so big categories dominate the Function score), set up a single rollup on Functions that traverses through Categories down to Subcategories using Notion's nested rollup. That's a different aggregation philosophy — pick one and document it.

### Adding a gap view

The `Target Score` column on each Subcategory is your aspirational maturity. To surface the gap visually:

1. Add a Formula property on Subcategories: `Gap = Target Score - Score`
2. Sort or color-code your Subcategory views by `Gap` to see the biggest deficits first
3. (Optional) Add a Category-level rollup of `Average(Target Score)` so each Category shows current maturity, target maturity, and the gap between them — that gives you a per-domain investment-priority list

## Notion import — manual rebuild from the loose CSVs

> **Recommended shortcut:** drag the [`CSF_Wiki/`](CSF_Wiki/) bundle into Notion (see the top of this README) to skip all of steps 1–6. You get a pre-wired workspace with relations, rollups, and all 106 subcategory pages already configured — just clear the reference data and start scoring your own. The manual steps below are the fallback for users who want full control of the build or want to regenerate from the app source-of-truth CSV.

1. Create a Notion page named **CSF Wiki** (or whatever you prefer).

2. Import the CSVs as inline databases. Inside the CSF Wiki page, type `/` then **Import** then **CSV** for each file: `functions.csv`, `categories.csv`, `subcategories.csv`, `findings.csv`, `artifacts.csv`. Select **Inline** (not Full Page) so the databases live on the same page. Notion uses the first column as the title.

3. Convert the relation columns — **read the warning below before starting this step.**

   > **Warning: auto-link is unreliable in current Notion versions.** When you convert a text column to a Relation, Notion may silently wipe the cell values instead of matching them to existing rows. The auto-link prompt frequently does not appear. Note your text values before converting any column so you can recover if needed.

   - Open the **Categories** database. Find the `Function` column (currently plain text). Click the column header, change type to **Relation**, set target = the Functions database. If an auto-link prompt appears, accept it.

     **Sanity check:** scroll all 22 Category rows. If any `Function` cell is empty, auto-link did not fire. Go to the Recovery path section below before continuing.

   - Open the **Subcategories** database. Find the `Category` column. Click the column header, change type to **Relation**, set target = the Categories database. When prompted for a two-way relation, **enable it** — this creates a back-relation on Categories that the rollup in step 4 requires.

     **Sanity check:** spot-check that subcategory rows show the correct Category in the relation cell.

   - Convert `Subcategory ID` on **Findings** and **Artifacts** to a **Relation** targeting the Subcategories database — this links every finding and artifact back to the control it evidences.

   - While still in **Subcategories**: click the `Score` column header and change type to **Number**. Do the same for `Target Score` and each `Q1`–`Q4 Actual Score`. Rollups can only Average numeric fields; text fields only offer Count.

   > **Note on the relation picker:** when manually linking rows, the picker displays the Category's title. If your Category titles are still plain IDs (`DE.AE`), the picker shows only the ID — type a prefix (e.g. `GV.`) to filter, or use the lookup table in the Appendix below. **Optional improvement:** after step 3, rename each Category row's title from `DE.AE` to `DE.AE — Adverse Event Analysis` — the picker will then show both, eliminating the need to memorize the ID-to-name mapping.

4. Add the rollups:
   - On **Categories**, add a new property of type **Rollup**. Source = the `subcategories` back-relation. Property = `Score`. Calculate = `Average`. Decimal places = 2. If you see a warning that the target property type changed, re-select `Score` in the picker to refresh it.
   - On **Categories**, add a second property of type **Formula**. Formula body: `prop("Rollup")`. This mirrors the rollup as a plain number — Notion does not allow one Rollup to directly target another Rollup, so the Formula is the bridge.
   - On **Functions**, add a new property of type **Relation** pointing to the Categories database. Link each of the 6 Function rows to its Categories manually.
   - On **Functions**, add a new property of type **Rollup**. Source = the Categories relation. Property = `Formula` (the one you just created). Calculate = `Average`. Decimal places = 2.

5. Bulk-paste each `subcategories/{ID}.md` into the matching Subcategory page body. Two routes:
   - **Manual:** open a Subcategory page and paste the file body — Notion converts markdown on paste.
   - **CSV import into existing database:** drag the CSV file directly onto the database, or use the `•••` database menu and look for **Merge with CSV** (label varies by Notion version). This is more reliable than the older Import → Markdown & CSV flow.

   > **Column paste-down:** when pasting multiple values into a Notion column, you must select the destination range first (Shift+click from first to last target cell). Pasting into a single selected cell dumps all values into that one cell as a concatenated string.

6. Verify relation cells. Open a Category row and confirm the `Function` relation cell shows the correct Function. Open a Subcategory row and confirm `Category` shows the correct Category. If any cells are empty, see the Recovery path below.

7. Pin a top-level page view that shows the Functions database with its Rollup column visible. That is your dashboard.

After step 4 your rollups are live. Score a single Subcategory and watch the Category and Function rollups update.

### Recovery path — when auto-link does not fire

If `Function` or `Category` Relation cells are empty after conversion:

1. Delete the empty Relation column.
2. Add a new Text property and re-paste the original values from the source CSV.
3. Try converting to Relation again. If auto-link still does not fire, proceed to manual linking.
4. **Manual linking:** sort the database by ID. For each row, click the Relation cell and search for the linked row. Type the ID prefix (e.g. `GV.`) to filter the picker. There are 22 Category rows and 6 Function rows — manual linking takes about 15 minutes total.

### Appendix — Function to Category mapping

Use this table when the relation picker shows Names instead of IDs.

| Function | Categories |
|----------|-----------|
| GV (GOVERN) | GV.OC, GV.RM, GV.RR, GV.PO, GV.OV, GV.SC |
| ID (IDENTIFY) | ID.AM, ID.RA, ID.IM |
| PR (PROTECT) | PR.AA, PR.AT, PR.DS, PR.IR, PR.PS |
| DE (DETECT) | DE.AE, DE.CM |
| RS (RESPOND) | RS.MA, RS.AN, RS.CO, RS.MI |
| RC (RECOVER) | RC.RP, RC.CO |

## Schema

The subcategory database mirrors the app's source-of-truth profile CSV, so a Notion assessment and the app stay column-compatible. Findings and Artifacts mirror the JIRA exports and relate back to Subcategories.

<!-- BEGIN GENERATED: schema -->
**`subcategories.csv`** — one row per subcategory (where all scoring happens).
Mirrors the app profile CSV, at the subcategory grain. Columns:

`ID, Category, Function, Description, In Scope?, Owner, Stakeholders, Auditor,
NIST 800-53 Control Ref, Test Procedures, Score, Target Score,
Q1–Q4 {Actual Score, Target Score, Observations, Observation Date, Testing Status,
Examine, Interview, Test}, Remediation Owner, Remediation Due Date, Minimum Target,
Action Plan, Artifact Name`

- `Category` → relation to `categories.csv`; `Function` → denormalized filter column.
- `Score` / `Target Score` are the latest populated quarter (the value Notion rolls up).
- The four quarterly blocks give the time dimension for quarterly GRC snapshots.
- Subcategory-level assessment values are taken from each subcategory's **primary
  implementation example (Ex1)**; every implementation example is preserved verbatim
  on the subcategory page body.

**`findings.csv`** — mirrors `JIRA-Findings.csv`. Columns:

`Summary, Subcategory ID, Issue Key, Issue Type, Status, Priority, Assignee, Reporter,
Created, Updated, Due Date, Root Cause, Vulnerability, Remediation Action Plan,
Testing Status, Description`

**`artifacts.csv`** — mirrors `JIRA-Artifacts.csv`. Columns:

`Summary, Subcategory ID, Issue Key, Issue Type, Status, Priority, Assignee, Reporter,
Created, Updated, Link, Description`

`Subcategory ID` on Findings and Artifacts is a **relation-ready** column: convert it
to a Notion Relation targeting the Subcategories database to link every finding and
artifact back to the subcategory it evidences. It is pre-populated wherever a
subcategory ID (e.g. `PR.IR-01`) appears in the source finding/artifact text.
<!-- END GENERATED: schema -->

`functions.csv` — `ID, Name, Description` (loose path). The bundle copy additionally carries `Actual Score`, `Target Score`, and relation columns to `categories` / `subcategories`.

`categories.csv` — `ID, Name, Description, Function` (loose path). `Function` references `functions.csv ID` for the Notion relation.

## GRC migration path

`subcategories.csv` exported back out of Notion — enriched with the quarterly scores, observations, scoping, 800-53 references, remediation, auditor, and stakeholders — is the single artifact to feed into your GRC platform (Archer, Hyperproof, OneTrust, ServiceNow GRC, MetricStream, etc.). Because it mirrors the app profile CSV column-for-column, it round-trips cleanly back into the app as well. Most GRC tools import CSV directly or via a vendor template into which you can map columns 1:1.

The Functions and Categories databases are browsing scaffolding for the Notion stage. Discard them at migration — your GRC tool's CSF taxonomy module already provides them.

## Source data and regeneration

<!-- BEGIN GENERATED: counts -->
This bundle is generated from the app source-of-truth CSV
(`GET_THE_SPREADSHEETS/yyyy-mm-dd_CSF_Profile.csv`) by `_generate.ts`.

- **Functions:** 6
- **Categories:** 22
- **Subcategories:** 106
- **Implementation examples preserved:** 362
- **Findings:** 4
- **Artifacts:** 25

| Function | Name | Categories | Subcategories | Actual (avg) | Target (avg) |
|----------|------|-----------|---------------|--------------|--------------|
| DE | DETECT | 2 | 11 | 2.666666666666667 | 3.166666666666667 |
| GV | GOVERN | 6 | 31 | 2.024206349206349 | 1.6468253968253965 |
| ID | IDENTIFY | 3 | 21 | 1.0023809523809524 | 1.392857142857143 |
| PR | PROTECT | 5 | 22 | 2.25 | 2 |
| RC | RECOVER | 2 | 8 | 0.4583333333333333 | 0.4166666666666667 |
| RS | RESPOND | 4 | 13 | 1.275 | 1.5 |
<!-- END GENERATED: counts -->

There is **one source of truth**: the app's exported profile CSV. `_generate.ts` consumes it and emits every derived artifact in this folder — the loose CSVs, the `subcategories/` markdown pages, and the `CSF_Wiki/` drag-import bundle — so nothing drifts. The legacy `source/CSF-implementation-examples.csv` was a strict projection of that file and has been removed.

To regenerate:

```sh
# default — reads GET_THE_SPREADSHEETS/yyyy-mm-dd_CSF_Profile.csv,
# JIRA-Findings.csv, and JIRA-Artifacts.csv
bun GET_THE_NOTION_TEMPLATE/_generate.ts

# explicit source path
bun GET_THE_NOTION_TEMPLATE/_generate.ts /path/to/CSF_Profile.csv

# or via env vars
CSF_SOURCE_CSV=/path/to/CSF_Profile.csv \
CSF_FINDINGS_CSV=/path/to/JIRA-Findings.csv \
CSF_ARTIFACTS_CSV=/path/to/JIRA-Artifacts.csv \
  bun GET_THE_NOTION_TEMPLATE/_generate.ts
```

The generator is **idempotent** — it rebuilds the `subcategories/` directory and the `CSF_Wiki/` bundle and overwrites all CSVs on every run; running it twice produces no diff. It never rewrites the prose in this README: only the three blocks between `<!-- BEGIN GENERATED: … -->` / `<!-- END GENERATED: … -->` markers are regenerated; everything outside them is preserved byte-for-byte.

## Publishing the hosted template (maintainers)

The one-click "Duplicate" experience requires a published Notion page — a one-time manual step for a workspace owner:

1. Import the `CSF_Wiki/` bundle into a clean page in the maintainer workspace (use the checklist above to verify).
2. Take a screenshot of the finished workspace (Functions dashboard with rollups visible) and add it to this README.
3. Click **Share** on the top-level wiki page → **Publish** tab → enable **Publish to web**.
4. Turn **ON** "Allow duplicate as template"; leave editing/comments off.
5. Copy the public `*.notion.site` URL and replace the placeholder in the "Zero-setup start" section at the top of this README.

Re-publish after any significant regeneration of the bundle so the hosted copy doesn't drift from the repo.

## What this wiki deliberately does NOT do

- **Score implementation examples.** Examples are read-only NIST reference text, surfaced on each Subcategory page for context — not their own database rows or pages. Subcategory-level assessment values are taken from each subcategory's primary example (Ex1).
- **Compute the canonical rollup in CSV.** The `Actual Score` snapshot the bundle ships on Categories and Functions is a convenience; the authoritative aggregation is Notion's job, done via Rollup properties on the relations.
- **Prescribe the "right" rubric.** The default CMMI-style 0–5 scale is a defensible starting point; pick your organization's calibration and edit the rubric section accordingly.
