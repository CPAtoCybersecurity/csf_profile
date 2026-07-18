# Get the Spreadsheets

The fastest way to use this project — no install, no code. The complete NIST CSF 2.0 guidance (functions, categories, subcategories, and implementation examples) flattened into a proper table you can filter, pivot, and report from.

## What's in this folder

| File | What it is | Use it for |
|------|-----------|------------|
| `yyyy-mm-dd_CSF_Profile.xlsx` | The main template — all CSF 2.0 guidance as a flat Excel table (Power Query-ready) | Quarterly profile assessments, radar/maturity charts, management reporting |
| `yyyy-mm-dd_CSF_Profile.csv` | Same data as plain CSV | Importing into any tool — Google Sheets, a database, or your AI assistant for CSF lookup, risk-assessment, and test-procedure prompts |
| `Confluence-Requirements.csv` | CSF requirements formatted for Confluence import | Building a controls wiki in Confluence |
| `JIRA-Assessments.csv` | Assessment records formatted for Jira import | Tracking assessments as Jira issues |
| `JIRA-Artifacts.csv` | Audit artifact templates for Jira import | "Test once, assure many" artifact tracking |
| `JIRA-Findings.csv` | Findings formatted for Jira import | Remediation tracking as Jira tickets |

## Quick start

1. Download `yyyy-mm-dd_CSF_Profile.xlsx` (rename with today's date).
2. Score the **Current** and **Target** columns for each subcategory in scope (scoring legend in the main [README](../README.md#scoring-system)).
3. Pivot by function or category to build your profile chart.

Tip: the CSV version drops cleanly into an AI assistant project/workspace, which makes a handy CSF lookup and drafting companion during assessments.

## Want more than a spreadsheet?

See [Choose Your Door](../README.md#-choose-your-door) in the main README — the same data is available as a Notion template and a local React app.
