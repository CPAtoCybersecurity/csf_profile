# CSF_Wiki — Ingestion Instructions

This folder is an LLM wiki, built the Karpathy way: drop raw source material into `raw/`, run a Claude Code session, get back linked markdown nodes in `wiki/`. No vector database, no embeddings, no extra infrastructure — just markdown files and `[[wikilinks]]`. Obsidian is optional; it's only a graph viewer on top of these same files.

Source: `CPAtoCybersecurity/catalyst` issue #79. Confirmed by the repo owner as community-facing — write for a public reader who may not know the CSF Profile app, not an internal team note.

## Raw folder layout

- `raw/nist_csf/` — NIST CSF 2.0 source material: Function/Category/Subcategory text, Implementation Examples. The canonical text already lives in this repo at `sample_csv_exports/yyyy-mm-dd_CSF_Profile.csv` (columns: Function, Function Description, Category ID, Category, Category Description, Subcategory ID, Subcategory Description, Implementation Example) and in `src/stores/comprehensiveAssessmentData.js` / `defaultControlsData.js` (real-world implementation narratives) — treat those as already-ingested raw material, no need to re-drop them.
- `raw/simply_cyber/` — Simply Cyber video summaries/transcripts. Drop as plain `.md` or `.txt`, one file per video.
- `raw/threat_briefing/` — Gerry's Daily Cyber Threat Briefing highlights. Same drop convention.

## Wiki node conventions

**File naming:** one file per CSF Subcategory, named by Subcategory ID — `wiki/<Function>/<Subcategory-ID>.md` (e.g. `wiki/GV/GV.OC-01.md`). Category-level and Function-level pages are index pages: `wiki/<Function>/_index.md` for the Function, no separate file needed per Category unless a Category accumulates enough cross-links to warrant its own hub.

**Node content shape:**
1. Subcategory ID + one-line description (from the canonical CSF text)
2. Category and Function it belongs to, each a `[[wikilink]]` to that index
3. Implementation Example(s) from NIST source text
4. Real-world implementation narrative(s), when available, pulled from `comprehensiveAssessmentData.js` / `defaultControlsData.js`
5. `## Related` section linking sibling Subcategories, relevant Simply Cyber video highlights, and relevant threat-briefing highlights

**Cross-linking:** use Obsidian-compatible `[[Target-File-Name]]` links (no `.md` extension inside the brackets). Every wiki node must link *up* to its Function index and *down or across* to at least one related node — orphan nodes are a build defect, not acceptable output.

**Linking new raw material into existing nodes:** when a new Simply Cyber or threat-briefing file lands in `raw/`, do NOT create a standalone unlinked page for it. Read it, identify which Subcategory node(s) it's relevant to, and add a link + one-paragraph excerpt into each relevant node's `## Related` section. A raw drop that produces no new links into existing Subcategory nodes was mis-scoped — either it belongs in the wiki somewhere, or it wasn't CSF-relevant material.

## Security+ extension (future)

Same pipeline, parallel subtree: `raw/security_plus/` and `wiki/security_plus/`, one node per exam objective instead of per Subcategory. Do not build this until the CSF side has real content in it — prove the pattern once before forking it.

## What NOT to do

- Do not modify `src/stores/*Data.js` — those are the app's data, this wiki reads from them, it does not fork them.
- Do not stand up a database, vector store, or search index for this. If retrieval ever gets clunky at scale, that's a future decision, not a default.
