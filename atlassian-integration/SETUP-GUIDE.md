# CSF Profile + Atlassian Setup Guide

Complete step-by-step instructions for setting up Confluence and Jira to work with the CSF Profile Assessment Database.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Create Atlassian Account](#phase-1-create-atlassian-account)
3. [Set Up Confluence Databases](#phase-2-set-up-confluence-databases)
4. [Set Up Jira Project](#phase-3-set-up-jira-project)
5. [Configure Integration Scripts](#phase-4-configure-integration-scripts)
6. [Sync Your Data](#phase-5-sync-your-data)
7. [Using Smart Links](#phase-6-using-smart-links)
8. [Workflow Recommendations](#workflow-recommendations)

---

## Prerequisites

- CSF Profile Assessment Database running locally
- Email address for Atlassian account
- Node.js 18+ installed

---

## Phase 1: Create Atlassian Account

**Time: ~5 minutes**

### 1.1 Sign Up for Free Atlassian Cloud

1. Go to [atlassian.com/try/cloud/signup](https://www.atlassian.com/try/cloud/signup)
2. Click **Get started free**
3. Enter your email and create account
4. Choose your site name (e.g., `yourcompany.atlassian.net`)
5. Select **Free** plan when prompted

**Free tier includes:**
- Confluence: Up to 10 users, unlimited spaces, databases included
- Jira Software: Up to 10 users, unlimited projects
- Native Confluence ↔ Jira linking

### 1.2 Generate API Token

1. Go to [id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Label: `CSF Profile Integration`
4. Click **Create**
5. **Copy the token immediately** - you won't see it again
6. Save it securely for Phase 4

---

## Phase 2: Set Up Confluence Databases

**Time: ~15 minutes**

### 2.1 Create Confluence Space

1. Go to `https://yoursite.atlassian.net/wiki`
2. Click **Spaces** in the left sidebar
3. Click **Create space**
4. Select **Blank space**
5. Configure:
   - **Name:** `CSF Compliance Program`
   - **Key:** `CSF` (or accept auto-generated)
6. Click **Create**

### 2.2 Create Requirements Database

1. Inside your new space, click **Create** (top right)
2. Select **Database**
3. Name: `CSF Requirements`
4. Click **Create**

#### Add Columns

Click the **+** button to add each column:

| Column Name | Field Type | Configuration |
|-------------|------------|---------------|
| Requirement ID | **Text** | This is your primary identifier |
| Framework | **Tag** | Add tags: `NIST CSF 2.0`, `ISO 27001`, `FedRAMP`, `CMMC` |
| Function | **Tag** | Add tags: `Govern (GV)`, `Identify (ID)`, `Protect (PR)`, `Detect (DE)`, `Respond (RS)`, `Recover (RC)` |
| Category | **Text** | Category name (e.g., "Supply Chain Risk Management") |
| Category ID | **Text** | Category code (e.g., "GV.SC") |
| Subcategory ID | **Text** | Subcategory code (e.g., "GV.SC-04") |
| Subcategory Description | **Text** | The full requirement text |
| Implementation Example | **Text** | Example implementation guidance |
| In Scope | **Tag** | Add tags: `In Scope`, `Out of Scope` |

#### Configure Database Settings

1. Click the **⋮** menu (top right of database)
2. Select **Database settings**
3. Enable **"Allow other databases to link to this one"**
4. Click **Save**

### 2.3 Create Controls Database

1. Click **Create** → **Database**
2. Name: `CSF Controls`
3. Click **Create**

#### Add Columns

| Column Name | Field Type | Configuration |
|-------------|------------|---------------|
| Control ID | **Text** | Primary identifier (e.g., "DE.AE-02 Ex1") |
| Control Description | **Text** | Control description details |
| Control Owner | **User** | Single user picker |
| Stakeholders | **User** | Enable "Allow multiple selections" |
| Linked Requirements | **Entry link** | See configuration below |
| Framework | **Tag** | Add tag: `NIST CSF 2.0` |
| Created Date | **Date** | |
| Last Modified | **Date** | |
| Assessment Tickets | **Jira work item** | Native Jira link field |

#### Configure the Entry Link Field (Linked Requirements)

This creates the relation between Controls and Requirements:

1. Click the **Linked Requirements** column header
2. Select field type: **Entry link** (under "Other Databases")
3. In the configuration:
   - **Select database:** `CSF Requirements`
   - **Allow multiple entries:** Yes
   - **Display property:** `Requirement ID` or `Subcategory ID`
4. Click **Save**

Now when editing a Control, you can link it to multiple Requirements from the Requirements database.

#### Configure the Jira Work Item Field

This creates native Confluence ↔ Jira linking:

1. Click the **Assessment Tickets** column header
2. Select field type: **Jira work item** (under "Jira")
3. Configuration options:
   - **Allow multiple items:** Yes (for quarterly assessments)
4. Click **Save**

When you add Jira issue keys to this field, they appear as live cards showing status, assignee, and priority.

---

## Phase 3: Set Up Jira Project

**Time: ~20 minutes**

### 3.1 Create Jira Project

1. Go to `https://yoursite.atlassian.net/jira`
2. Click **Projects** in the sidebar
3. Click **Create project**
4. Select **Company-managed project**
5. Choose **Kanban** template (recommended for assessments)
6. Configure:
   - **Name:** `CSF Assessments`
   - **Key:** `CSFA`
7. Click **Create**

### 3.2 Create Custom Issue Type

1. Go to **Project settings** (gear icon in sidebar)
2. Click **Issue types**
3. Click **+ Add issue type**
4. Configure:
   - **Name:** `Assessment Work Paper`
   - **Description:** `Individual control assessment for compliance testing`
5. Click **Add**

### 3.3 Create Custom Fields

Navigate to custom fields:
- **Option A:** Project settings → Fields → Actions → Edit fields
- **Option B:** Global settings (⚙️) → Issues → Custom fields → Create custom field

Create each field:

#### Control ID
- **Type:** Short text (single line)
- **Name:** `Control ID`
- **Description:** `Links to Confluence Control record`
- **Context:** Add to `Assessment Work Paper` issue type

#### Assessment Quarter
- **Type:** Select list (single choice)
- **Name:** `Assessment Quarter`
- **Options:** `Q1`, `Q2`, `Q3`, `Q4`

#### Assessment Year
- **Type:** Number field
- **Name:** `Assessment Year`

#### Target Score
- **Type:** Select list (single choice)
- **Name:** `Target Score`
- **Options:** `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`

#### Actual Score
- **Type:** Select list (single choice)
- **Name:** `Actual Score`
- **Options:** `0`, `1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`

#### Testing Status
- **Type:** Select list (single choice)
- **Name:** `Testing Status`
- **Options:** `Not Started`, `In Progress`, `Submitted`, `Complete`

#### Test Procedures
- **Type:** Paragraph (multi-line text)
- **Name:** `Test Procedures`

#### Observations
- **Type:** Paragraph (multi-line text)
- **Name:** `Observations`

#### Assessment Methods
- **Type:** Checkboxes
- **Name:** `Assessment Methods`
- **Options:** `Examine`, `Interview`, `Test`

### 3.4 Configure Issue Screen

Add your custom fields to the Assessment Work Paper screen:

1. Go to **Project settings** → **Screens** (or global settings)
2. Find/create screen for `Assessment Work Paper`
3. Add fields in this order:
   - Summary
   - Description
   - Control ID
   - Assessment Quarter
   - Assessment Year
   - Assignee *(built-in - this is the Auditor)*
   - Test Procedures
   - Assessment Methods
   - Observations
   - Target Score
   - Actual Score
   - Testing Status
   - Attachments *(built-in)*

### 3.5 Create Workflow

1. Go to **Project settings** → **Workflows**
2. Click **Add workflow** → **Create new**
3. Name: `Assessment Workflow`

#### Add Statuses

Create these statuses:
- `Not Started` (category: To Do)
- `In Progress` (category: In Progress)
- `Submitted` (category: In Progress)
- `Needs Rework` (category: In Progress)
- `Complete` (category: Done)

#### Add Transitions

| From | To | Transition Name |
|------|------|----------------|
| Not Started | In Progress | Start Assessment |
| In Progress | Submitted | Submit for Review |
| Submitted | Complete | Approve |
| Submitted | Needs Rework | Request Changes |
| Needs Rework | In Progress | Resume Work |

#### Visual Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Not Started │────►│ In Progress │────►│  Submitted  │────►│  Complete   │
└─────────────┘     └──────┬──────┘     └──────┬──────┘     └─────────────┘
                          │                    │
                          │    ┌───────────┐   │
                          └───►│Needs Rework│◄──┘
                               └───────────┘
```

#### Associate Workflow

1. Save the workflow
2. Go to **Workflow schemes**
3. Associate `Assessment Workflow` with `Assessment Work Paper` issue type

### 3.6 Create Kanban Board

1. Go to your project board
2. Click **Board settings** (if exists) or create new board
3. Configure columns to match your workflow:
   - Not Started
   - In Progress
   - Submitted
   - Complete

---

## Phase 4: Configure Integration Scripts

**Time: ~10 minutes**

### 4.1 Install Dependencies

```bash
cd /path/to/csf_profile/atlassian-integration
npm install
```

### 4.2 Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Atlassian Cloud Configuration
ATLASSIAN_SITE_URL=https://yoursite.atlassian.net
ATLASSIAN_EMAIL=your.email@example.com
ATLASSIAN_API_TOKEN=your_api_token_from_phase_1

# Confluence
CONFLUENCE_SPACE_KEY=CSF

# Jira
JIRA_PROJECT_KEY=CSFA
```

### 4.3 Find Jira Field IDs

Run the setup helper:

```bash
node scripts/setup-jira.js
```

Output will look like:

```
✓ Connected as: Your Name (your.email@example.com)

PROJECT INFORMATION
Name: CSF Assessments
Key: CSFA

ISSUE TYPES
  Assessment Work Paper
    ID: 10015              ← Copy this!

CUSTOM FIELDS
  Control ID
    ID: customfield_10042  ← Copy this!
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

### 4.4 Update .env with Field IDs

Add the IDs to your `.env` file:

```env
# Jira Issue Type
JIRA_ASSESSMENT_ISSUE_TYPE_ID=10015

# Jira Custom Field IDs
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

## Phase 5: Sync Your Data

### 5.1 Export from CSF Profile

1. Open CSF Profile in your browser (`localhost:3000`)
2. Go to **Settings** page
3. Click **Export All (JSON)**
4. Save to: `atlassian-integration/exports/csf-export.json`

### 5.2 Export to Confluence

Generate CSV files for Confluence database import:

```bash
# Export both Requirements and Controls
node scripts/export-to-confluence.js --file exports/csf-export.json --type all

# Or export separately
node scripts/export-to-confluence.js --file exports/csf-export.json --type requirements
node scripts/export-to-confluence.js --file exports/csf-export.json --type controls
```

Output files appear in `output/`:
- `confluence-requirements.csv`
- `confluence-controls.csv`

#### Import CSV to Confluence Database

1. Open your Confluence database (e.g., `CSF Requirements`)
2. Click the **⋮** menu (top right)
3. Select **Import from CSV**
4. Upload the generated CSV file
5. Map columns:
   - Match CSV headers to database columns
   - Verify the preview looks correct
6. Click **Import**
7. Repeat for Controls database

### 5.3 Export to Jira

Create Jira issues from your assessments:

```bash
# Preview what will be created (recommended first)
node scripts/export-to-jira.js --file exports/csf-export.json --dry-run

# Create issues in Jira
node scripts/export-to-jira.js --file exports/csf-export.json

# Export specific assessment only
node scripts/export-to-jira.js --file exports/csf-export.json --assessment "2025 Alma"

# Export specific quarter only
node scripts/export-to-jira.js --file exports/csf-export.json --quarter Q1
```

### 5.4 Import from Jira

Pull assessment updates back to CSF Profile:

```bash
# Import all issues from your project
node scripts/import-from-jira.js --output imports/jira-import.json

# Custom JQL filter
node scripts/import-from-jira.js --jql 'project = CSFA AND status = Complete' --output imports/completed.json
```

Then import the JSON file in CSF Profile:
1. Go to **Settings** → **Import**
2. Select the generated JSON file
3. Review and confirm

---

## Phase 6: Using Smart Links

### Native Jira Work Item Links (Recommended)

With the **Jira work item** field in your Controls database:

1. Open a Control record in Confluence
2. Click the **Assessment Tickets** field
3. Type or paste a Jira issue key (e.g., `CSFA-42`)
4. The issue appears as a live card showing:
   - Issue summary
   - Status (with color)
   - Assignee avatar
   - Priority icon

**Benefits:**
- Live status updates (no manual sync)
- Click to navigate directly to Jira
- Jira shows backlink to Confluence automatically
- Works with multiple issues per control

### Smart Links in Jira Descriptions

The export script automatically includes Confluence links in Jira issue descriptions:

```markdown
## Control Details
[View Control in Confluence](https://yoursite.atlassian.net/wiki/spaces/CSF/database/123)

**Control ID:** DE.AE-02 Ex1
**Linked Requirements:** DE.AE-02, DE.AE-03

## Test Procedures
[Procedures from CSF Profile]
```

When pasted in Jira, URLs become interactive Smart Links with hover previews.

### Manual Smart Links

To manually add Smart Links:

1. Copy any Atlassian URL (Confluence page, database entry, Jira issue)
2. Paste into a text field in Confluence or Jira
3. It automatically converts to a Smart Link card

---

## Workflow Recommendations

### When to Use Each Tool

| Task | Recommended Tool | Why |
|------|------------------|-----|
| Initial control design | CSF Profile | Fast iteration, offline capable |
| Control documentation | Confluence | Better for collaboration, versioning |
| Team review/approval | Confluence | Comments, @mentions, page history |
| Assessment execution | Jira | Assignments, due dates, workflow |
| Evidence collection | Jira + Confluence | Attachments + linked pages |
| Progress tracking | Jira | Dashboards, JQL queries, reports |
| Quick self-assessment | CSF Profile | Simpler UI, immediate scoring |
| Management reporting | Jira | Built-in reports, export options |

### Recommended Sync Cadence

```
Initial Setup:
  CSF Profile → Confluence (all requirements and controls)

Weekly/As Needed:
  CSF Profile → Confluence (control updates)

Per Assessment Cycle (Quarterly):
  CSF Profile → Jira (create work papers)

During Assessment:
  Work in Jira (update status, observations, scores)

After Assessment:
  Jira → CSF Profile (sync completed assessments)
  Update Confluence Control records with Jira links
```

### Complementary Use Patterns

**Pattern 1: CSF Profile as Design Tool**
- Use CSF Profile for rapid control development
- Export finalized controls to Confluence for "official" version
- Assessment work happens in Jira

**Pattern 2: Atlassian as Primary**
- Maintain controls directly in Confluence
- All assessments in Jira
- Import to CSF Profile for analysis/visualization

**Pattern 3: Hybrid**
- Use CSF Profile for internal/quick assessments
- Use Atlassian for formal audits requiring work papers
- Sync bidirectionally as needed

---

## Troubleshooting

### Connection Errors

**"Missing Atlassian credentials"**
- Ensure `.env` file exists (not `.env.example`)
- Verify all three values are set: `ATLASSIAN_SITE_URL`, `ATLASSIAN_EMAIL`, `ATLASSIAN_API_TOKEN`

**"401 Unauthorized"**
- Regenerate your API token
- Ensure email matches your Atlassian account
- Check site URL has no trailing slash

### Field Mapping Errors

**"Field 'customfield_XXXXX' does not exist"**
- Run `node scripts/setup-jira.js` to find correct field IDs
- Update `.env` with actual IDs from your Jira instance

**CSV import column mismatch**
- Ensure column headers in CSV match Confluence database columns
- Check for extra spaces in headers

### Data Issues

**"Invalid export file format"**
- Use JSON export from CSF Profile (not CSV)
- Ensure file has `data` property with `requirements`, `controls`, `assessments`

**Duplicate entries after import**
- Confluence CSV import creates new entries (doesn't update)
- Delete existing entries before reimporting, or use as merge

---

## Quick Reference

### Script Commands

```bash
# Test connection
node scripts/setup-jira.js

# Export to Confluence (CSV)
node scripts/export-to-confluence.js --file exports/csf-export.json --type all

# Export to Jira (creates issues)
node scripts/export-to-jira.js --file exports/csf-export.json

# Import from Jira
node scripts/import-from-jira.js --output imports/jira-import.json

# Dry run (preview only)
node scripts/export-to-jira.js --file exports/csf-export.json --dry-run
```

### Key URLs

| Resource | URL Pattern |
|----------|-------------|
| Confluence Space | `https://yoursite.atlassian.net/wiki/spaces/CSF` |
| Confluence Database | `https://yoursite.atlassian.net/wiki/spaces/CSF/database/[ID]` |
| Jira Project | `https://yoursite.atlassian.net/jira/software/projects/CSFA` |
| Jira Issue | `https://yoursite.atlassian.net/browse/CSFA-123` |
| API Token Management | `https://id.atlassian.com/manage-profile/security/api-tokens` |

### Confluence Field Types Reference

| CSF Profile Concept | Confluence Field Type |
|---------------------|----------------------|
| Dropdown/Select | **Tag** |
| Multi-select | **Tag** (allows multiple) |
| Yes/No | **Tag** with two options |
| Long text | **Text** |
| User reference | **User** |
| Link to other database | **Entry link** |
| Link to Jira | **Jira work item** |
| URL | **Smart Link** |
| File attachment | **Media and files** |

---

## Support

- **CSF Profile issues:** Check main project README
- **Atlassian API:** [developer.atlassian.com](https://developer.atlassian.com)
- **Confluence Databases:** [Confluence Database documentation](https://support.atlassian.com/confluence-cloud/docs/what-are-databases/)
- **Jira REST API:** [Jira Cloud REST API docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
