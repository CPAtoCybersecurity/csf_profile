# Load Data Manually

Native CSV import into Jira and Confluence — no Node, no API token, no AI subscription. You'll upload the templates from [`templates/`](templates/) straight into your Atlassian site using Atlassian's built-in importers.

**Total time:** ~45 minutes for first-time setup of custom fields, ~10 minutes for re-imports after.
**Prerequisites:** [`ATLASSIAN-SETUP.md`](ATLASSIAN-SETUP.md) completed (Confluence space + Jira project shell exist).

---

## What you're uploading

| Source file | Imports as | Target |
|---|---|---|
| `Confluence-Requirements.csv` | Confluence database entries | Confluence space `CSF` |
| `JIRA-Assessments.csv` | Jira issues, type `Work paper` | Jira project (`EVAL` or `CSFA`) |
| `JIRA-Artifacts.csv` | Jira issues, type `Assessment Artifact` | Jira project |
| `JIRA-Findings.csv` | Jira issues, type `Task` | Jira project |
| `../GET_THE_SPREADSHEETS/yyyy-mm-dd_CSF_Profile.csv` | Reference / archive only | Keep alongside as the master ledger |

---

## Part A — Confluence: the Requirements database

### A.1 Create the database

1. Open your `CSF Compliance Program` space
2. Click **Create** → **Database**
3. Name it `CSF Requirements`
4. Click **Create**

### A.2 Add the columns (Confluence schema for native CSV import)

The CSV in [`templates/Confluence-Requirements.csv`](templates/Confluence-Requirements.csv) has these headers — match them exactly so the importer auto-maps:

| Column | Field type | Notes |
|---|---|---|
| Requirement ID | Text | Primary identifier (e.g., `DE.AE-02 Ex1`) |
| Framework | Tag | Tags: `NIST CSF 2.0`, `ISO 27001`, `FedRAMP`, `CMMC` |
| CSF Function | Tag | Tags: `GOVERN (GV)`, `IDENTIFY (ID)`, `PROTECT (PR)`, `DETECT (DE)`, `RESPOND (RS)`, `RECOVER (RC)` |
| CSF Function Description | Text | |
| Category Name | Text | e.g., `Adverse Event Analysis (DE.AE)` |
| Category Description | Text | |
| Subcategory ID | Text | e.g., `DE.AE-02` |
| Subcategory Description | Text | |
| Implementation Example | Text | NIST example guidance |
| Implementation Description (Control) | Text | Your control writeup |
| Control Owner | User | Single user picker |
| Stakeholders | User | Allow multiple |
| Artifacts | Text | Free text or Jira work item link |
| Findings | Text | Free text or Jira work item link |
| Control Evaluation Back Link | Smart Link | Paste Jira work-paper URL — auto-renders as a card |

### A.3 Import the CSV

1. With the `CSF Requirements` database open, click the **⋮** menu (top right)
2. Select **Import from CSV**
3. Upload [`templates/Confluence-Requirements.csv`](templates/Confluence-Requirements.csv)
4. The mapping screen appears — verify each CSV column maps to its database column
5. Click **Import**

Confluence creates one entry per CSV row.

---

## Part B — Jira: custom fields for the work papers

The sample CSVs use this custom-field schema. Create each field once, then add them to the screen for the relevant issue type. Go to **Project settings → Fields** (or global **Settings → Issues → Custom fields**).

### B.1 Quarterly scoring fields (×4)

Create the same trio for **Q1, Q2, Q3, Q4** — twelve fields total:

| Field name | Type | Notes |
|---|---|---|
| `Q1 Target Score` (and Q2/Q3/Q4) | Number | 0–10 |
| `Q1 Actual Score` (and Q2/Q3/Q4) | Number | 0–10 |
| `Q1 Observations` (and Q2/Q3/Q4) | Paragraph | Multi-line notes |

### B.2 Assessment metadata

| Field name | Type | Notes |
|---|---|---|
| `Test Procedures` | Paragraph | How the control will be tested |
| `Testing Status` | Select (single) | `Not Started`, `In Progress`, `Submitted`, `Complete`, `Needs Rework` |
| `Assessment Methods` | Checkboxes | `Examine`, `Interview`, `Test` |
| `Compliance Requirement` | Short text | Subcategory ID (e.g., `GV.SC-02`) |
| `Control Link` | URL / Smart Link | Link back to the Confluence Control record |
| `Artifacts` | Short text | Evidence artifact names or AR-* keys |
| `Remediation Action Plan` | Paragraph | Who will do what by when |
| `Root Cause` | Paragraph | For Findings |
| `Vulnerability` | Short text | For Findings |

### B.3 Add fields to the screen

For each issue type (`Work paper`, `Assessment Artifact`, `Task` for Findings):

1. **Project settings → Screens** → find/create the screen for that issue type
2. Add the relevant fields in the order shown in the sample CSV
3. Save

---

## Part C — Jira CSV import

Jira's native CSV importer handles all three issue-type files.

### C.1 Open the importer

1. **Settings (⚙️)** → **System** → **External system import**
2. Click **CSV**

### C.2 For each of the three Jira CSVs

Repeat the import for [`templates/JIRA-Assessments.csv`](templates/JIRA-Assessments.csv), [`templates/JIRA-Artifacts.csv`](templates/JIRA-Artifacts.csv), and [`templates/JIRA-Findings.csv`](templates/JIRA-Findings.csv). Recommended order: **Findings → Artifacts → Assessments** (so Parent links resolve correctly for Assessments, which references Artifacts as parents in the sample data).

1. **Setup:**
   - Upload the CSV
   - Use **UTF-8** encoding
   - Date format: `dd/MMM/yy h:mm a` (matches the export format `11/Jan/26 3:21 PM`)
2. **Project:**
   - Select your project (`EVAL`, `CSFA`, `AR`, or `FND` — match the **Project key** column in the CSV, or override to use one project for everything)
3. **Field mapping:**
   - Most fields auto-map by name
   - For each `Custom field (X)` column, map it to the matching custom field you created in Part B
   - Map **Issue Type** to the right type (`Work paper`, `Assessment Artifact`, `Task`)
   - Map **Parent** (Assessments only) to link work papers to Artifacts
4. **Value mapping:**
   - If Jira asks about unknown status values, map them to your workflow statuses (Not Started, In Progress, etc.)
5. Click **Begin Import**
6. Review the log for any rejected rows

### C.3 Sanity check

After import, open one issue from each type and verify:

- **Work paper:** quarterly scores populated, Test Procedures non-empty, Compliance Requirement set
- **Artifact:** linked to the relevant work paper as a parent
- **Finding:** Remediation Action Plan, Root Cause, Vulnerability all populated

---

## Part D — Wire Confluence ↔ Jira together

This is where the manual path pays off: native Atlassian Smart Links keep Confluence and Jira in sync without any code.

1. In a Confluence Requirement entry, paste a Jira issue URL (e.g., `https://yoursite.atlassian.net/browse/EVAL-82`) into the **Control Evaluation Back Link** column — it auto-renders as a live card
2. In a Jira work paper, paste the Confluence database entry URL into the **Control Link** field — same effect
3. Smart Links update live as either side changes

---

## Re-importing (assessment cycle N+1)

The schema persists. For each new cycle:

1. Export updated CSVs from your CSF Profile workspace (or pull fresh templates from [`templates/`](templates/))
2. Repeat **Part C** with the new files — Jira will offer to **update existing issues** based on `Issue key`
3. Confluence CSV import always creates new entries (it doesn't update) — delete the old database content first or use a fresh database

---

## Gotchas

- **Confluence CSV import doesn't update existing entries.** It only creates new ones. Plan for periodic full reloads, or use the CLI path if you need true update semantics.
- **Jira CSV import needs an admin role.** A regular project member can't run external-system import.
- **Smart Links require the Atlassian domain to be accessible from both sides.** Mostly automatic for cloud sites.
- **Field IDs vary by site.** If you ever switch to the CLI path, you'll need to run `node scripts/setup-jira.js` from `../atlassian-integration/` to discover your field IDs.

---

## Decide what to do next

After your first successful import:

- **Stay manual:** keep using the CSV importer for each cycle. Acceptable cadence: quarterly.
- **Move to CLI:** see [`LOAD-DATA-WITH-CLI.md`](LOAD-DATA-WITH-CLI.md) — gives you `--dry-run`, idempotent updates, and bidirectional sync.
- **Try cowork:** see [`LOAD-DATA-WITH-CLAUDE-COWORK.md`](LOAD-DATA-WITH-CLAUDE-COWORK.md) — useful when you want Claude to drive the Jira UI for non-routine edits (mass status transitions, custom field reorganization).
