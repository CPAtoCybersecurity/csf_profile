# Atlassian (Jira / Confluence) Integration — Discontinued / Parked

This directory holds the **experimental** Jira + Confluence live integration that was
removed from the CSF Profile app. Development of the integration has been discontinued.
The code is kept here as a reference in case the idea is revisited — it is **not wired
into the app** and is not built, run, or tested.

## What was removed from the app

- Settings "Atlassian API Configuration" section (credentials, connection test,
  Confluence entry-ID harvesting, Smart-Embed).
- `src/utils/confluenceSync.js` frontend util (now `frontend/confluenceSync.js` here).
- `src/utils/envValidation.js` Atlassian env-var validation (now `frontend/envValidation.js`).
- Atlassian-specific error UI in `src/components/ErrorBoundary.js`.
- Smart-embed URL usage in the assessments CSV export.
- Server routes/controllers/services/validators for `/api/jira`, `/api/confluence`,
  and `/api/config` (now under `server/` here).
- `SET_UP_IN_ATLASSIAN/` setup docs and the `atlassian-integration/` scripts.

## What was kept in the app

- CSV import/export of assessments, findings, and artifacts (Jira/Confluence-compatible
  CSV format) — still fully supported in Settings.
- The internal record key field (`jiraKey`, e.g. `FND-1`, `AR-1`) — it is the data model,
  not the integration.
- The Claude AI Assistant (`/api/ai/*`) — unrelated, unaffected.

## Reviving the experiment

The relocated files retain their original relative imports, which assumed their old
locations under `src/` and `server/`. To revive, move them back (or fix the relative
paths) and re-add the route registrations to `server/index.js` and the Settings UI.
