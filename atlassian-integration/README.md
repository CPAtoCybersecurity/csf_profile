# CSF Profile ↔ Atlassian Integration

Sync your CSF Profile Assessment Database with Atlassian Confluence and Jira.

## Overview

This integration enables bidirectional data flow between the CSF Profile web app and Atlassian tools:

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   CSF Profile       │     │   Integration       │     │   Atlassian         │
│   Assessment DB     │◄───►│   Scripts           │◄───►│   Cloud             │
│   (Browser/Local)   │     │   (Node.js CLI)     │     │   (Confluence/Jira) │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## Quick Start

### 1. Install Dependencies

```bash
cd atlassian-integration
npm install
```

### 2. Configure Atlassian Credentials

```bash
cp .env.example .env
# Edit .env with your Atlassian credentials
```

Get your API token from: https://id.atlassian.com/manage-profile/security/api-tokens

### 3. Find Your Jira Field IDs

```bash
node scripts/setup-jira.js
```

This will display all your custom field IDs. Update `.env` with the correct IDs.

### 4. Export from CSF Profile

1. Open CSF Profile Assessment Database in your browser
2. Go to Settings → Export → Export All (JSON)
3. Save the file to `atlassian-integration/exports/`

### 5. Sync to Atlassian

**Export Requirements/Controls to Confluence:**
```bash
node scripts/export-to-confluence.js --file exports/csf-export.json --type all
```

**Export Assessments to Jira:**
```bash
node scripts/export-to-jira.js --file exports/csf-export.json
```

**Import from Jira back to CSF Profile:**
```bash
node scripts/import-from-jira.js --output imports/jira-import.json
```

## Scripts Reference

### export-to-confluence.js

Exports Requirements and Controls as CSV files for Confluence database import.

```bash
# Export all data
node scripts/export-to-confluence.js --file exports/csf-export.json --type all

# Export only requirements
node scripts/export-to-confluence.js --file exports/csf-export.json --type requirements

# Export only controls
node scripts/export-to-confluence.js --file exports/csf-export.json --type controls

# Dry run (preview without creating files)
node scripts/export-to-confluence.js --file exports/csf-export.json --dry-run
```

### export-to-jira.js

Creates Jira issues from Assessment work papers.

```bash
# Export all assessments
node scripts/export-to-jira.js --file exports/csf-export.json

# Export specific assessment
node scripts/export-to-jira.js --file exports/csf-export.json --assessment "2025 Alma"

# Export specific quarter only
node scripts/export-to-jira.js --file exports/csf-export.json --quarter Q1

# Dry run
node scripts/export-to-jira.js --file exports/csf-export.json --dry-run
```

### import-from-jira.js

Imports assessment data from Jira back to CSF Profile format.

```bash
# Import all issues from project
node scripts/import-from-jira.js --output imports/jira-import.json

# Custom JQL query
node scripts/import-from-jira.js --jql 'project = CSFA AND status = Complete' --output imports/completed.json

# Dry run
node scripts/import-from-jira.js --dry-run
```

### setup-jira.js

Helper script to find Jira configuration IDs.

```bash
node scripts/setup-jira.js
```

## Data Mapping

### Requirements (Confluence Database)

| CSF Profile Field | Confluence Column |
|-------------------|-------------------|
| id | Requirement ID |
| frameworkId | Framework |
| function | Function |
| category | Category |
| categoryId | Category ID |
| subcategoryId | Subcategory ID |
| subcategoryDescription | Subcategory Description |
| implementationExample | Implementation Example |
| inScope | In Scope |

### Controls (Confluence Database)

| CSF Profile Field | Confluence Column |
|-------------------|-------------------|
| controlId | Control ID |
| implementationDescription | Implementation Description |
| ownerId | Control Owner |
| stakeholderIds | Stakeholders |
| linkedRequirementIds | Linked Requirements |
| createdDate | Created Date |
| lastModified | Last Modified |

### Assessments (Jira Issues)

| CSF Profile Field | Jira Field |
|-------------------|------------|
| (generated) | Summary |
| (generated) | Description (with Smart Links) |
| observations[].auditorId | Assignee |
| controlId | Control ID (custom) |
| observations[].quarters[Q].testingStatus | Testing Status (custom) |
| observations[].testProcedures | Test Procedures (custom) |
| observations[].quarters[Q].observations | Observations (custom) |
| observations[].quarters[Q].targetScore | Target Score (custom) |
| observations[].quarters[Q].actualScore | Actual Score (custom) |

## Smart Links Setup

The integration automatically includes Smart Links in Jira issue descriptions that link back to Confluence. To enable:

1. Set `CONFLUENCE_CONTROLS_DB_ID` in your `.env` file
2. Exported issues will include clickable links to the Control record in Confluence

## Workflow Integration

### Recommended Workflow

1. **CSF Profile** (Primary): Use for rapid control definition and assessment planning
2. **Confluence** (Reference): Store approved requirements and controls
3. **Jira** (Execution): Track assessment work papers, assignments, and deadlines

### Sync Strategy

```
Weekly:
  CSF Profile → Confluence (sync control updates)

Per Assessment Cycle:
  CSF Profile → Jira (create work papers)
  Jira → CSF Profile (sync completed assessments)
```

## Troubleshooting

### "Missing Atlassian credentials"

Ensure your `.env` file exists and contains:
- `ATLASSIAN_SITE_URL`
- `ATLASSIAN_EMAIL`
- `ATLASSIAN_API_TOKEN`

### "Invalid export file format"

Make sure you're using the JSON export from CSF Profile (not CSV). The file should have a `data` property containing `requirements`, `controls`, `assessments`, etc.

### Custom field errors

Run `node scripts/setup-jira.js` to find your actual custom field IDs. The IDs in `.env.example` are placeholders.

### Rate limiting

Atlassian APIs have rate limits. If you're exporting many issues, the script will slow down automatically. For very large exports, consider using `--dry-run` first to verify.

## File Structure

```
atlassian-integration/
├── .env.example          # Template for credentials
├── .env                  # Your credentials (git-ignored)
├── package.json          # Dependencies
├── README.md             # This file
├── lib/
│   ├── atlassian-client.js   # API client
│   └── data-transformer.js   # Data conversion
├── scripts/
│   ├── export-to-confluence.js
│   ├── export-to-jira.js
│   ├── import-from-jira.js
│   └── setup-jira.js
├── exports/              # Place CSF Profile exports here
└── output/               # Generated files appear here
```

## Support

For issues with:
- **CSF Profile**: Check the main project README
- **Atlassian APIs**: https://developer.atlassian.com/
- **This integration**: File an issue in the project repository
