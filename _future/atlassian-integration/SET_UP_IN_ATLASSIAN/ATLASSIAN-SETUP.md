# Atlassian-Side Setup

One-time setup of the Atlassian Cloud site, Confluence space, and Jira project shell. After this, pick a load-data path from [`README.md`](README.md).

**Total time:** ~30 minutes
**Prerequisites:** an email address. That's it.

---

## Step 1 — Create the Atlassian Cloud site

**Time: ~5 minutes**

### 1.1 Sign up for free Atlassian Cloud

1. Go to <https://www.atlassian.com/try/cloud/signup>
2. Click **Get started free**
3. Enter your email and create the account
4. Choose your site name (e.g., `yourcompany.atlassian.net`)
5. Select the **Free** plan

Free tier includes:
- Confluence: up to 10 users, unlimited spaces, databases included
- Jira Software: up to 10 users, unlimited projects
- Native Confluence ↔ Jira linking

### 1.2 Generate an API token (only needed for the CLI path)

Skip this step if you're going to use the **Manual** or **Claude cowork** path. Only the **CLI** path needs an API token.

1. Go to <https://id.atlassian.com/manage-profile/security/api-tokens>
2. Click **Create API token**
3. Label it `CSF Profile Integration`
4. Click **Create**
5. **Copy the token now** — you won't see it again
6. Store it somewhere safe (password manager)

---

## Step 2 — Create the Confluence space

**Time: ~10 minutes**

The Confluence space holds your CSF Requirements and Controls as databases. Assessment results in Jira will link back here.

### 2.1 Create the space

1. Go to `https://yoursite.atlassian.net/wiki`
2. Click **Spaces** in the left sidebar
3. Click **Create space** → **Blank space**
4. Configure:
   - **Name:** `CSF Compliance Program`
   - **Key:** `CSF` (or accept the auto-generated key)
5. Click **Create**

### 2.2 Decide your data-load path before adding databases

The Confluence database schema depends on which load path you'll use:

| Load path | Database schema source |
|---|---|
| Manual | [`LOAD-DATA-MANUALLY.md`](LOAD-DATA-MANUALLY.md) → "Confluence schema for native CSV import" |
| Claude cowork | [`LOAD-DATA-WITH-CLAUDE-COWORK.md`](LOAD-DATA-WITH-CLAUDE-COWORK.md) → recipe creates the schema for you |
| CLI | [`LOAD-DATA-WITH-CLI.md`](LOAD-DATA-WITH-CLI.md) → schema is in `../atlassian-integration/SETUP-GUIDE.md` |

The space itself is path-agnostic. Don't add databases yet — your chosen load path will tell you exactly which columns to create so the data lines up.

---

## Step 3 — Create the Jira project shell

**Time: ~10 minutes**

This creates an empty project with the right workflow. Custom fields are added by your chosen load-data path.

### 3.1 Create the project

1. Go to `https://yoursite.atlassian.net/jira`
2. Click **Projects** → **Create project**
3. Select **Company-managed project**
4. Choose the **Kanban** template (recommended for assessments)
5. Configure:
   - **Name:** `CSF Assessments`
   - **Key:** `CSFA` (or `EVAL` if you want to match the sample CSVs in `../GET_THE_SPREADSHEETS/`)
6. Click **Create**

### 3.2 Create the assessment workflow

Default Jira workflows don't have the right statuses for compliance work. Create a custom one:

1. **Project settings** (gear icon) → **Workflows**
2. **Add workflow** → **Create new**
3. Name: `Assessment Workflow`

Add these statuses:

| Status | Category |
|---|---|
| Not Started | To Do |
| In Progress | In Progress |
| Submitted | In Progress |
| Needs Rework | In Progress |
| Complete | Done |

Add these transitions:

| From | To | Transition name |
|---|---|---|
| Not Started | In Progress | Start Assessment |
| In Progress | Submitted | Submit for Review |
| Submitted | Complete | Approve |
| Submitted | Needs Rework | Request Changes |
| Needs Rework | In Progress | Resume Work |

Visual:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Not Started │───►│ In Progress │───►│  Submitted  │───►│  Complete   │
└─────────────┘    └──────┬──────┘    └──────┬──────┘    └─────────────┘
                          │                   │
                          │   ┌───────────┐   │
                          └──►│Needs Rework│◄─┘
                              └───────────┘
```

Save the workflow and associate it with the project's default issue type.

### 3.3 Create the issue types you'll need

The sample CSVs in `../GET_THE_SPREADSHEETS/` assume three issue types. Create them under **Project settings → Issue types → + Add issue type**:

| Issue type | Purpose | Maps to CSV |
|---|---|---|
| `Work paper` | One per control assessment | `JIRA-Assessments.csv` |
| `Assessment Artifact` | Evidence (screenshots, logs, exports) | `JIRA-Artifacts.csv` |
| `Task` (built-in, use for Findings) | Remediation items | `JIRA-Findings.csv` |

You can rename the built-in types to match if you prefer — Jira lets you call them whatever you want.

### 3.4 Custom fields — defer to your load path

Custom fields (Q1–Q4 scores, Test Procedures, Compliance Requirement, Control Link, etc.) get created when you follow your chosen load-data file. The schemas differ slightly between paths — let your load path drive this so the data shape matches your import method.

---

## You're set up

Confluence space exists, Jira project exists with the workflow, API token (if needed) is saved. Now pick:

- **Manual native import** → [`LOAD-DATA-MANUALLY.md`](LOAD-DATA-MANUALLY.md)
- **Claude cowork** → [`LOAD-DATA-WITH-CLAUDE-COWORK.md`](LOAD-DATA-WITH-CLAUDE-COWORK.md)
- **CLI toolkit** → [`LOAD-DATA-WITH-CLI.md`](LOAD-DATA-WITH-CLI.md)
