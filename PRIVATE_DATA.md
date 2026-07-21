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

## Organization profile — private data too

The optional organization profile (Settings → Organization Profile: business type, size,
key systems, security tools, **crown jewels**) is the most sensitive record the app holds —
the crown-jewel list plus your tooling reads like an attacker's shopping list. Its handling:

- **Lives only in this browser's localStorage** (`csf-org-profile-storage`). Never in the repo,
  never uploaded anywhere by the app.
- **Never in shareable exports — unconditionally.** The include-private opt-in restores pack
  data, but NOT the profile.
- **The derived-text leak path is closed too.** Tailoring bakes profile facts (org name,
  crown-jewel references) into procedure text on observations. Shared exports swap every
  tailored procedure back to the **pristine community version** using its provenance
  (`procedureSource.bankId`); if the bank entry can't be resolved, the text is dropped, never
  leaked. Only the include-private opt-in keeps tailored text.
- **Complete backups DO carry it** (that is their job — restore must round-trip your setup).
  Password-protect backup files that carry a profile.
- **Cloud AI consent gate.** Profile text goes to the local Ollama provider freely (nothing
  leaves your machine). Sending it to a cloud provider (Claude API) requires the explicit
  consent checkbox in Settings — off by default, and stored consent can be revoked any time.
- **Own-data exports are NOT scrubbed.** The assessment CSV exports, Jira CSVs, and
  "Export Assessments Only" JSON are your-own-data files: they keep tailored procedure text
  as-is (that is what makes them useful to you). The scrubbed artifact is the **Share
  export** only — hand people `csf_share_*.json`, not a CSV, when org context must stay out.

### Platform procedure references (format 5)

Platform addenda (SCuBA baselines) attach as **references**, never copies:
`platformProcedures: [{ corpusId, corpusVersion, policyId, contentHash }]` on the
observation, with the composition recipe recorded in `procedureSource.components`. One
expansion function turns references into text at render and at every text egress (CSV,
Jira, share export), asserting upstream attribution from provenance each time; a reference
this install cannot resolve renders an explicit placeholder carrying its identity — never a
silent drop. **Share exports are self-contained** (format 5): the references are expanded
into the procedure text so a receiving install never depends on corpus presence or version,
and the reference list itself never rides a share. **Complete backups carry references
verbatim** (wholesale by design). Editing an addendum forks it copy-on-write into a
concrete value you own, so nothing user-authored can ever become unresolvable. There are no
corpus snapshots: when upstream revises or withdraws a policy, the fix is re-attaching from
the regenerated corpus, not migrating old text.

### Procedure provenance and staleness (v1 non-goal)

Attached community procedures are **copies** (`copy-on-attach`) with a provenance object:
`procedureSource: { bank, bankId, bankVersion, attachedAt, modified, tailored }`. When the
community bank ships a corrected procedure, already-attached copies are NOT auto-updated —
`bankVersion` and `modified` exist for auditability and the share-export swap, not for
re-sync. The manual refresh affordance is **Reset to community version** on the requirement's
detail panel; `modified` is what makes a future safe re-sync possible without clobbering
user edits.

## Sharing safely

The Settings export card offers two intents:

- **Backup** — everything, including pack data and metrics catalogues. For your own machine only. Files are named `*.backup.json` and gitignored.
- **Share export** — excludes pack-sourced records **and imported metric definitions** by default, including the whole pack-owned assessment and everything inside it (the filter follows lineage, not just tags). Quarter-level `metricId` links pointing at excluded metrics are stripped so no identifier from a private catalogue rides out on your own records, and all envelope counts are recomputed after filtering. Including private data requires ticking a box *and* confirming a warning — and restricted-license metrics stay excluded even then. Default-safe beats remember-to-scrub.

### The disposition registry — how the share filter is enforced

The share filter is not a hand-maintained scrub list. Every field that can appear in a share
export is **declared** in `src/utils/shareRegistry.js` with a disposition — share / omit /
empty / rebuild / strip — and `buildShareableExport` is a mechanical fold over those
declarations. A field nobody declared does not serialize, in either share mode (fail-closed,
the inversion of the historical default that produced four separate field leaks). Two tests
enforce the registry from both ends:

- the **appearance test** (`src/utils/shareRegistry.test.js`) builds state through the real
  producers and fails on any field path the registry does not name — a new feature's new
  field is a red test at commit time, forcing a disposition decision instead of a silent
  leak found later;
- the **golden snapshots** (`src/utils/dataExportGolden.test.js`) freeze all three envelopes
  (default share, include-private share, complete backup), so a disappearance is a visible
  diff rather than a silent loss.

A third guard works at surface grain: the **egress census** (`src/utils/egressCensus.test.js`)
fails when any file gains a browser-download path (`URL.createObjectURL` / jsPDF `doc.save`)
without an inventoried posture — a brand-new exporter cannot be born fail-open either.

Complete backups are wholesale by design and bypass the registry. The own-data exports (the
CSV exports, Jira CSVs, "Assessments Only" JSON) remain the documented exception described
above: they are working artifacts for your own use, not the sharing surface.

### The user directory — private data too

The Users page (and, since issue #290, the new-assessment wizard's Users step) holds real people: names and email addresses, with roles of auditor, control owner, or stakeholder scoped per assessment. Share exports **exclude the user directory by default** — the `data.users` section is omitted entirely unless you explicitly include private data (omitted, not emptied: restoring a share file therefore leaves the receiving install's own directory untouched). The per-assessment `{ userId, role }` pairs and each observation's `auditorId` stay (they are opaque identifiers) and resolve against whatever directory the receiving install already has. Complete backups always keep the full directory. Note this deliberately changed pre-existing behavior — before issues #290/#291 the directory rode share exports wholesale, which mattered less when it only ever held the fictional demo users.

### External ticketing/document URLs — private data too

Findings, artifacts, and controls can carry links into your own systems (a Jira or ServiceNow ticket, a Google Drive or SharePoint document, a control record in your compliance tool — see the External Tracking option in the new-assessment wizard). Since issue #288 an assessment names a **separate system per record type** (findings / artifacts / controls), and each evaluation item can carry a list of typed external links added directly on the evaluation panel. Those URLs and system names reveal your internal hostnames, site paths, project keys, and tooling choices, so share exports **scrub them by default**: `findings.externalUrl`, `artifacts.link`, `controls.externalUrl`, every observation's `externalLinks` list, and all three `externalTracking.systems` names are blanked unless you explicitly include private data. Note this deliberately changed the artifact `link` field's behavior — before issue #284 it rode share exports untouched. Complete backups always keep every URL and system name.

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
