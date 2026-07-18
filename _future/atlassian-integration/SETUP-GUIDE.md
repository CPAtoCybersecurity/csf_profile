# CSF Profile + Atlassian — CLI Toolkit Setup

CLI-specific setup for the standalone Node toolkit in this folder. Picks up after the user-facing Atlassian-side setup (account, Confluence space, Jira project) lives in `../SET_UP_IN_ATLASSIAN/ATLASSIAN-SETUP.md`.

---

## Prerequisites

**Before reading this file**, complete the Atlassian-side setup:

→ **[`../SET_UP_IN_ATLASSIAN/ATLASSIAN-SETUP.md`](../SET_UP_IN_ATLASSIAN/ATLASSIAN-SETUP.md)**

That covers:
- Atlassian Cloud site (free tier)
- API token generation
- Confluence space (`CSF Compliance Program`, key `CSF`)
- Jira project shell + workflow

You also need:
- CSF Profile Assessment Database running locally — see `../INSTALL_THE_APP/`
- Node.js 18+ installed

---

## CLI-specific schema note

The toolkit uses a different Jira custom-field schema than the sample CSVs in `../GET_THE_SPREADSHEETS/`:

- **This toolkit (CLI):** one Jira issue per (control × quarter) — `Assessment Quarter` is a single-select field with options Q1, Q2, Q3, Q4
- **Manual import path:** one Jira issue per control with Q1–Q4 fields baked in

If you're going CLI-first, follow the field list in [Phase 3](#phase-3-add-cli-schema-custom-fields-jira) below — NOT the manual path's field list. Mixing the two creates confused dashboards.

---

## Phase 2 — Add Confluence database schema (CLI shape)

In the Confluence space from `ATLASSIAN-SETUP.md`, add two databases the CLI expects:

### 2.1 `CSF Requirements` database

| Column | Type | Notes |
|---|---|---|
| Requirement ID | Text | Primary identifier |
| Framework | Tag | `NIST CSF 2.0`, `ISO 27001`, `FedRAMP`, `CMMC` |
| Function | Tag | `Govern (GV)`, `Identify (ID)`, `Protect (PR)`, `Detect (DE)`, `Respond (RS)`, `Recover (RC)` |
| Category | Text | e.g., "Supply Chain Risk Management" |
| Category ID | Text | e.g., "GV.SC" |
| Subcategory ID | Text | e.g., "GV.SC-04" |
| Subcategory Description | Text | Full requirement text |
| Implementation Example | Text | Example implementation guidance |
| In Scope | Tag | `In Scope`, `Out of Scope` |

Enable **"Allow other databases to link to this one"** in Database settings.

### 2.2 `CSF Controls` database

| Column | Type | Notes |
|---|---|---|
| Control ID | Text | Primary (e.g., "DE.AE-02 Ex1") |
| Control Description | Text | |
| Control Owner | User | Single user picker |
| Stakeholders | User | Allow multiple |
| Linked Requirements | Entry link | Target: `CSF Requirements`, allow multiple |
| Framework | Tag | `NIST CSF 2.0` |
| Created Date | Date | |
| Last Modified | Date | |
| Assessment Tickets | Jira work item | Allow multiple — native Jira link cards |

---

## Phase 3 — Add CLI-schema custom fields (Jira)

In the Jira project from `ATLASSIAN-SETUP.md`, add a custom issue type and these custom fields.

### 3.1 Custom issue type

**Project settings → Issue types → + Add issue type:**

- **Name:** `Assessment Work Paper`
- **Description:** `Individual control assessment for compliance testing`

### 3.2 Custom fields (CLI schema — one issue per quarter)

Navigate to **Project settings → Fields** or global **Settings → Issues → Custom fields**.

| Field | Type | Options/Notes |
|---|---|---|
| Control ID | Short text | Links to Confluence Control |
| Assessment Quarter | Single-select | `Q1`, `Q2`, `Q3`, `Q4` |
| Assessment Year | Number | |
| Target Score | Single-select | `0`–`10` |
| Actual Score | Single-select | `0`–`10` |
| Testing Status | Single-select | `Not Started`, `In Progress`, `Submitted`, `Complete` |
| Test Procedures | Paragraph | |
| Observations | Paragraph | |
| Assessment Methods | Checkboxes | `Examine`, `Interview`, `Test` |

### 3.3 Add fields to the screen

**Project settings → Screens** → find/create screen for `Assessment Work Paper`, then add in order:

1. Summary
2. Description
3. Control ID
4. Assessment Quarter
5. Assessment Year
6. Assignee *(built-in — this is the Auditor)*
7. Test Procedures
8. Assessment Methods
9. Observations
10. Target Score
11. Actual Score
12. Testing Status
13. Attachments *(built-in)*

### 3.4 Associate the workflow

The `Assessment Workflow` from `ATLASSIAN-SETUP.md` Step 3.2 needs to be associated with this issue type:

1. **Project settings → Workflow schemes**
2. Edit the active scheme
3. Associate `Assessment Workflow` with `Assessment Work Paper`

### 3.5 Kanban board columns

Match your workflow:

- Not Started
- In Progress
- Submitted
- Complete

---

## Phase 4 — Configure the toolkit scripts

**Time: ~10 minutes**

### 4.1 Install dependencies

```bash
cd /path/to/csf_profile/atlassian-integration
npm install
```

### 4.2 Create the environment file

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Atlassian Cloud Configuration
ATLASSIAN_SITE_URL=https://yoursite.atlassian.net
ATLASSIAN_EMAIL=your.email@example.com
ATLASSIAN_API_TOKEN=your_api_token_from_atlassian-setup

# Confluence
CONFLUENCE_SPACE_KEY=CSF

# Jira
JIRA_PROJECT_KEY=CSFA
```

### 4.3 Discover your Jira field IDs

```bash
node scripts/setup-jira.js
```

Output:

```
✓ Connected as: Your Name (your.email@example.com)

PROJECT INFORMATION
Name: CSF Assessments
Key: CSFA

ISSUE TYPES
  Assessment Work Paper
    ID: 10015              ← copy

CUSTOM FIELDS
  Control ID
    ID: customfield_10042  ← copy
  Assessment Quarter
    ID: customfield_10043
  Assessment Year
    ID: customfield_10044
  Target Score
    ID: customfield_10045
  Actual Score
    ID: customfield_10046
  Testing Status
    ID: customfield_10047
  Test Procedures
    ID: customfield_10048
  Observations
    ID: customfield_10049
```

### 4.4 Update `.env` with the field IDs

```env
JIRA_ASSESSMENT_ISSUE_TYPE_ID=10015

JIRA_FIELD_CONTROL_ID=customfield_10042
JIRA_FIELD_QUARTER=customfield_10043
JIRA_FIELD_YEAR=customfield_10044
JIRA_FIELD_TARGET_SCORE=customfield_10045
JIRA_FIELD_ACTUAL_SCORE=customfield_10046
JIRA_FIELD_TESTING_STATUS=customfield_10047
JIRA_FIELD_TEST_PROCEDURES=customfield_10048
JIRA_FIELD_OBSERVATIONS=customfield_10049
```

---

## Phase 5 — Sync your data

### 5.1 Export from CSF Profile

1. Open CSF Profile in your browser (`localhost:3000`)
2. **Settings** → **Export All (JSON)**
3. Save to `atlassian-integration/exports/csf-export.json`

### 5.2 Export to Confluence

```bash
# Both databases
node scripts/export-to-confluence.js --file exports/csf-export.json --type all

# Just one
node scripts/export-to-confluence.js --file exports/csf-export.json --type requirements
node scripts/export-to-confluence.js --file exports/csf-export.json --type controls
```

Generated files appear in `output/`:
- `confluence-requirements.csv`
- `confluence-controls.csv`

**Import to Confluence:**

1. Open your database (e.g., `CSF Requirements`)
2. ⋮ menu → **Import from CSV**
3. Upload the generated CSV
4. Verify column mapping
5. Click **Import**
6. Repeat for Controls

### 5.3 Export to Jira

```bash
# Dry-run first (recommended)
node scripts/export-to-jira.js --file exports/csf-export.json --dry-run

# Create issues
node scripts/export-to-jira.js --file exports/csf-export.json

# Filter
node scripts/export-to-jira.js --file exports/csf-export.json --assessment "2025 Alma"
node scripts/export-to-jira.js --file exports/csf-export.json --quarter Q1
```

### 5.4 Pull updates back from Jira

```bash
# All issues
node scripts/import-from-jira.js --output imports/jira-import.json

# Custom JQL
node scripts/import-from-jira.js --jql 'project = CSFA AND status = Complete' --output imports/completed.json
```

Then in CSF Profile: **Settings → Import → select the JSON file → confirm.**

---

## Phase 6 — Smart Links

### Native Jira work item links (the right default)

With the **Jira work item** field on your Controls database:

1. Open a Control record in Confluence
2. Click the **Assessment Tickets** field
3. Type/paste a Jira issue key (e.g., `CSFA-42`)
4. The issue renders as a live card with status, assignee, priority

### Smart Links in Jira issue descriptions

`export-to-jira.js` automatically embeds Confluence links in issue descriptions:

```markdown
## Control Details
[View Control in Confluence](https://yoursite.atlassian.net/wiki/spaces/CSF/database/123)

**Control ID:** DE.AE-02 Ex1
**Linked Requirements:** DE.AE-02, DE.AE-03

## Test Procedures
[from CSF Profile]
```

### Manual smart links

Paste any Atlassian URL into any text field — Atlassian auto-converts to a card.

---

## Workflow recommendations

### When to use each tool

| Task | Tool | Why |
|---|---|---|
| Initial control design | CSF Profile (React app) | Fast iteration, offline-capable |
| Control documentation | Confluence | Collaboration, versioning |
| Team review/approval | Confluence | Comments, @mentions, history |
| Assessment execution | Jira | Assignments, due dates, workflow |
| Evidence collection | Jira + Confluence | Attachments + linked pages |
| Progress tracking | Jira | Dashboards, JQL, reports |
| Quick self-assessment | CSF Profile | Simpler UI, immediate scoring |
| Management reporting | Jira | Built-in reports, exports |

### Sync cadence

```
Initial Setup:
  CSF Profile → Confluence (all requirements and controls)

Weekly/As Needed:
  CSF Profile → Confluence (control updates)

Per Assessment Cycle (Quarterly):
  CSF Profile → Jira (create work papers)

During Assessment:
  Work in Jira (status, observations, scores)

After Assessment:
  Jira → CSF Profile (pull completed assessments)
  Update Confluence Control records with Jira links
```

### Patterns

**Pattern 1 — CSF Profile as design tool:** rapid control development in the app, export finalized version to Confluence, assessment work in Jira.

**Pattern 2 — Atlassian as primary:** maintain controls directly in Confluence, all assessments in Jira, import to CSF Profile for analysis only.

**Pattern 3 — Hybrid:** CSF Profile for internal/quick assessments, Atlassian for formal audits with work papers, sync bidirectionally.

---

## Troubleshooting

### Connection errors

**"Missing Atlassian credentials"**
- `.env` exists (not just `.env.example`)
- All three are set: `ATLASSIAN_SITE_URL`, `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`

**"401 Unauthorized"**
- Regenerate the API token
- Email matches your Atlassian account
- Site URL has no trailing slash

### Field mapping errors

**"Field 'customfield_XXXXX' does not exist"**
- Re-run `node scripts/setup-jira.js`
- Update `.env` with real IDs (not the example placeholders)

**CSV import column mismatch**
- CSV headers must match Confluence database columns exactly
- Watch for trailing spaces

### Data issues

**"Invalid export file format"**
- Use the JSON export from CSF Profile, not CSV
- File should have `data` property with `requirements`, `controls`, `assessments`

**Duplicate entries after Confluence import**
- Confluence CSV import always creates new entries (no update mode)
- Delete existing entries before re-import, or use a fresh database

---

## Quick reference

### Commands

```bash
# Test connection + discover field IDs
node scripts/setup-jira.js

# Export to Confluence (CSV)
node scripts/export-to-confluence.js --file exports/csf-export.json --type all

# Export to Jira (creates issues)
node scripts/export-to-jira.js --file exports/csf-export.json

# Import from Jira
node scripts/import-from-jira.js --output imports/jira-import.json

# Dry run
node scripts/export-to-jira.js --file exports/csf-export.json --dry-run
```

### URLs

| Resource | URL pattern |
|---|---|
| Confluence space | `https://yoursite.atlassian.net/wiki/spaces/CSF` |
| Confluence database | `https://yoursite.atlassian.net/wiki/spaces/CSF/database/[ID]` |
| Jira project | `https://yoursite.atlassian.net/jira/software/projects/CSFA` |
| Jira issue | `https://yoursite.atlassian.net/browse/CSFA-123` |
| API tokens | `https://id.atlassian.com/manage-profile/security/api-tokens` |

### Confluence field types

| CSF Profile concept | Confluence field type |
|---|---|
| Dropdown/Select | Tag |
| Multi-select | Tag (allows multiple) |
| Yes/No | Tag with two options |
| Long text | Text |
| User reference | User |
| Link to other database | Entry link |
| Link to Jira | Jira work item |
| URL | Smart Link |
| File attachment | Media and files |

---

## Support

- **CSF Profile issues:** main project README
- **Atlassian API:** <https://developer.atlassian.com>
- **Confluence Databases:** <https://community.atlassian.com/forums/Confluence-articles/Confluence-Databases-101/ba-p/2399851>
- **Jira REST API:** <https://developer.atlassian.com/cloud/jira/platform/rest/v3/>
