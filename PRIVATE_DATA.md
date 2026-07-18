# Private data packs — bring your own data, keep it private

The CSF Profile engine is public. Your assessment data is not. A **private data pack** is a single JSON file, kept outside any git repository, that loads your organization's real scores, observations, and risk entries into the app on your machine. The repo ships the engine; you bring the payload.

Your pack never touches this repository, any fork, or any server. The app reads it through the import dialog and stores the merged result in your browser's localStorage. Nothing is uploaded.

## Quick start

1. Author a pack file (format below). Name it `<org>.csfpack.json` and keep it **outside every git clone** — your documents folder, a private drive, anywhere that is not a repo.
2. In the app: **Settings → Private data pack → Import pack**.
3. Review the preview (what will be created, what will be replaced), then confirm.
4. Re-import the same pack any time — updates replace what the pack owns, and never duplicate it.

## Pack format (`packFormat: 1`)

```json
{
  "packFormat": 1,
  "engineMin": "2.2.0",
  "packVersion": "2026.07",
  "org": {
    "slug": "alma-security",
    "name": "Alma Security",
    "sector": "technology",
    "sizeBand": "50-200"
  },
  "created": "2026-07-14",
  "sections": {
    "metricValues": [
      {
        "subcategoryId": "GV.SC-04",
        "quarters": {
          "Q2": {
            "actualScore": 2,
            "targetScore": 3,
            "testingStatus": "Tested",
            "observations": "Supplier criticality tiers defined for top 20 vendors."
          }
        }
      }
    ],
    "risks": [
      {
        "id": "R-001",
        "title": "Wire-transfer BEC",
        "subcategoryIds": ["PR.AA-01"],
        "likelihood": 4,
        "impact": 5,
        "notes": "Finance team targeted twice in 2025."
      }
    ]
  }
}
```

| Field | Required | Meaning |
|-------|----------|---------|
| `packFormat` | yes | Envelope version. This build reads format 1. Newer formats are rejected with an upgrade message, never partially imported. |
| `engineMin` | no | Minimum app version the pack needs. If it is newer than your build, import is refused with an explicit message. |
| `packVersion` | yes | Your own version stamp (any string). Shown in provenance and the import log. |
| `org.slug` | yes | Stable identity key. Re-imports match on this — bump `packVersion` freely, keep `slug` constant. |
| `org.name` | yes | Display name. Used to name the assessment the pack creates. |
| `sections.metricValues` | no | Quarterly scores/observations per CSF 2.0 subcategory ID. Imported into a **new assessment owned by the pack** (never your active assessment). |
| `sections.risks` | no | Risk entries. Imported as findings with pack provenance. |
| `sections.resources`, `sections.frameworks` | no | Accepted by the validator and reported in the preview, but not yet applied by this build. The preview says so explicitly — nothing is silently dropped. |

Unknown sections warn-and-skip: a pack written for a future engine still imports the sections this build understands, and tells you what it skipped.

## What import does

- **Creates a pack-owned assessment** named after your org. It never writes into an assessment you created by hand.
- **Tags everything** it writes with `source: "pack"`, your `org.slug`, and `packVersion`.
- **Re-import replaces, never duplicates.** The `org.slug` is the identity key: importing `packVersion: 2026.08` over `2026.07` replaces the pack-owned assessment and pack-sourced findings. The preview warns you before replacing anything you edited locally since the last import.

## Metrics catalogues (`*.csfmetrics.csv`) — private data too

The same bring-your-own model covers **KPIs, KRIs, and metrics**. The app ships no metric
content: you import your own catalogue as a local CSV (Settings → Metrics Catalogue) and
browse it under **Metrics** — drill down from CSF functions → categories → subcategories to
the metrics mapped to each. This keeps licensed material an organization is entitled to use
internally (for example CIS-derived metrics) out of this MIT repository while your local
install still gives it a first-class UI.

CSV schema v1 — header row required, one metric per row:

```
metric_id,name,type,csf_subcategory_ids,description,formula,unit,target,direction,frequency,data_source,license,references,notes
```

- `type` is `KPI`, `KRI`, or `metric` (case-insensitive).
- `csf_subcategory_ids` is semicolon-separated (`ID.AM-01;ID.AM-02`).
- Unknown columns warn-and-skip; the file name (minus `.csfmetrics.csv`) becomes the
  catalogue's identity — re-importing the same file name replaces it, never duplicates.
- **`license` is enforcement, not documentation**: a catalogue whose license contains
  NC, ND, `proprietary`, or `internal` is **hard-blocked** from shareable exports — the
  include-private opt-in does not override it, because redistributing such content would
  violate its license. Backup exports (your own machine) always include everything.

## Sharing safely

The Settings export card offers two intents:

- **Backup** — everything, including pack data and metrics catalogues. For your own machine only. Files are named `*.backup.json` and gitignored.
- **Share export** — excludes pack-sourced records **and imported metric definitions** by default, including the whole pack-owned assessment and everything inside it (the filter follows lineage, not just tags). Quarter-level `metricId` links pointing at excluded metrics are stripped so no identifier from a private catalogue rides out on your own records, and all envelope counts are recomputed after filtering. Including private data requires ticking a box *and* confirming a warning — and restricted-license metrics stay excluded even then. Default-safe beats remember-to-scrub.

## Defense in depth

Even though packs and catalogues should never be inside a clone, the repo guards against accidents:

- `.gitignore` ships `*.csfpack.json`, `private-data/`, and `*.csfmetrics.csv`.
- CI fails any pull request that contains a `*.csfpack.json` file, a `private-data/` directory, a `*.backup.json` file, or a `*.csfmetrics.csv` file.
- CI also fails on **content**: any tracked JSON carrying the `packFormat` signature, and any tracked CSV carrying the metrics-catalogue header signature, is rejected no matter what it is named. The only exceptions are the two fictional test fixtures, allowlisted by exact path.

These are backstops, not the mechanism. The mechanism is separation: the pack and your catalogues live outside the tree.

## Known boundaries (v1)

- **Subcategory matching targets your active (default) framework.** IDs that do not exist in it are skipped and listed in the preview. When one subcategory has several requirement rows, values attach to the lowest row id and the preview says so.
- **References you create by hand are yours.** If you manually link one of your own findings or notes to a pack-owned assessment, a shareable export keeps your record (with its dangling reference) while stripping the pack target. Don't put private facts in your own records if you plan to share the export.

## Versioning contract

- This build reads `packFormat` 1. When format 2 lands (risk-register fields), a migration shim will read format 1 packs unchanged.
- A pack whose `packFormat` or `engineMin` is newer than the app is **rejected with an explicit message** — never silently skipped or partially imported.
- The test suite imports a fictional example pack (Alma Security) on every CI run, so the import path cannot rot unnoticed.
