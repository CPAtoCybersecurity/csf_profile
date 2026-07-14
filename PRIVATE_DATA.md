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

## Sharing safely

The Settings export card offers two intents:

- **Backup** — everything, including pack data. For your own machine only. Files are named `*.backup.json` and gitignored.
- **Share export** — excludes pack-sourced records **by default**, including the whole pack-owned assessment and everything inside it (the filter follows lineage, not just tags). Including private data requires ticking a box *and* confirming a warning. Default-safe beats remember-to-scrub.

## Defense in depth

Even though packs should never be inside a clone, the repo guards against accidents:

- `.gitignore` ships `*.csfpack.json` and `private-data/`.
- CI fails any pull request that contains a `*.csfpack.json` file, a `private-data/` directory, or a `*.backup.json` file.
- CI also fails on pack **content**: any tracked JSON carrying the `packFormat` signature is rejected no matter what it is named. The one exception is the fictional test fixture, allowlisted by exact path.

These are backstops, not the mechanism. The mechanism is separation: the pack lives outside the tree.

## Known boundaries (v1)

- **Subcategory matching targets your active (default) framework.** IDs that do not exist in it are skipped and listed in the preview. When one subcategory has several requirement rows, values attach to the lowest row id and the preview says so.
- **References you create by hand are yours.** If you manually link one of your own findings or notes to a pack-owned assessment, a shareable export keeps your record (with its dangling reference) while stripping the pack target. Don't put private facts in your own records if you plan to share the export.

## Versioning contract

- This build reads `packFormat` 1. When format 2 lands (risk-register fields), a migration shim will read format 1 packs unchanged.
- A pack whose `packFormat` or `engineMin` is newer than the app is **rejected with an explicit message** — never silently skipped or partially imported.
- The test suite imports a fictional example pack (Alma Security) on every CI run, so the import path cannot rot unnoticed.
