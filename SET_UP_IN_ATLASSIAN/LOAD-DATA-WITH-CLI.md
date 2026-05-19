# Load Data with the CLI Toolkit

A standalone Node CLI at [`../atlassian-integration/`](../atlassian-integration/) bridges the CSF Profile React app's JSON export ↔ Jira/Confluence. Best when you want **idempotent, scriptable, bidirectional** sync — assessments flow CSF Profile → Jira, then completed work flows Jira → CSF Profile.

**Prerequisites:**
- [`ATLASSIAN-SETUP.md`](ATLASSIAN-SETUP.md) completed (Confluence space + Jira project shell exist)
- API token generated (Step 1.2 of ATLASSIAN-SETUP)
- Node.js 18+ installed
- A CSF Profile JSON export from the React app (Settings → Export → Export All JSON) — get it by running [`../INSTALL_THE_APP/`](../INSTALL_THE_APP/) first

---

## Where the docs actually live

The full setup walkthrough for the CLI path lives with the toolkit it documents:

- **[`../atlassian-integration/README.md`](../atlassian-integration/README.md)** — script reference, data maps, smart links, troubleshooting
- **[`../atlassian-integration/SETUP-GUIDE.md`](../atlassian-integration/SETUP-GUIDE.md)** — Phases 4–5: configure scripts, sync data (Phases 1–3 are duplicated in this folder's [`ATLASSIAN-SETUP.md`](ATLASSIAN-SETUP.md) — read those first)

This file is a navigation pointer plus a quick-reference cheat sheet.

---

## Quick-reference: the four scripts

| Script | What it does |
|---|---|
| `setup-jira.js` | Discovers your Jira custom field IDs and prints them in `.env` format. **Run this first.** |
| `export-to-confluence.js` | Generates CSVs from a CSF Profile JSON export, ready for Confluence database CSV import. |
| `export-to-jira.js` | Creates Jira issues directly via the REST API. Supports `--dry-run`, `--quarter`, `--assessment` filters. |
| `import-from-jira.js` | Pulls Jira issues back to CSF Profile JSON format. Supports custom JQL queries. |

---

## Five-step quick start

```bash
# 1. Install
cd ../atlassian-integration
npm install

# 2. Configure credentials
cp .env.example .env
# edit .env with your ATLASSIAN_SITE_URL, EMAIL, API_TOKEN, JIRA_PROJECT_KEY, CONFLUENCE_SPACE_KEY

# 3. Discover field IDs (paste output into .env)
node scripts/setup-jira.js

# 4. Export your CSF Profile data
# from the React app: Settings → Export → Export All (JSON) → save to atlassian-integration/exports/csf-export.json

# 5. Sync
node scripts/export-to-confluence.js --file exports/csf-export.json --type all
node scripts/export-to-jira.js --file exports/csf-export.json --dry-run
node scripts/export-to-jira.js --file exports/csf-export.json
```

After the assessment cycle:

```bash
# Pull completed work back to CSF Profile
node scripts/import-from-jira.js --output imports/jira-import.json
# then in the React app: Settings → Import → select imports/jira-import.json
```

---

## Schema difference vs. the manual path

The CLI toolkit was designed around a slightly different Jira custom-field schema than the sample CSVs in [`templates/`](templates/) use. Specifically:

- **CLI schema:** one issue per (control × quarter) — `Assessment Quarter` is a single-select field
- **Manual schema:** one issue per control — Q1/Q2/Q3/Q4 fields are baked into the schema

Both work; they're different mental models for the same data. **Pick one schema per project** — mixing leads to confused dashboards. If you're starting fresh, the CLI schema is cleaner for JQL-heavy teams; the manual schema is denser and easier to scan.

The CLI toolkit's setup guide ([`../atlassian-integration/SETUP-GUIDE.md`](../atlassian-integration/SETUP-GUIDE.md)) Phase 3 describes the CLI schema. Follow that instead of [`LOAD-DATA-MANUALLY.md`](LOAD-DATA-MANUALLY.md) Part B if you're going CLI-first.

---

## When to use the CLI over the other paths

| Situation | Use CLI? |
|---|---|
| Quarterly assessment cadence, automated | Yes |
| Want `--dry-run` before any change | Yes |
| Need to pull assessment status from Jira into a dashboard or report | Yes |
| One-time setup, never re-import | No — manual is simpler |
| Don't have Node or don't want to | No — manual or cowork |
| Want full audit trail on every sync | Yes — scripts log everything; less reproducible with manual or cowork |

---

## Gotchas

- **API token != password.** Use the token (Step 1.2 of `ATLASSIAN-SETUP.md`). Passwords don't work against Atlassian's API.
- **Field IDs are site-specific.** Don't copy `.env.example` field IDs verbatim — run `setup-jira.js` to discover yours.
- **Rate limiting.** Large exports trigger Atlassian rate limits; the script backs off automatically but a 1000-issue export still takes minutes.
- **`.env` is gitignored.** Don't commit credentials.
