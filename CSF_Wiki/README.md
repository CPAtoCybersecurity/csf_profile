# CSF Wiki

A browsable, cross-linked knowledge base for NIST Cybersecurity Framework 2.0 — built by dropping source material into a folder and letting an LLM organize it into a linked markdown wiki. No app to install to read it: it's plain markdown, viewable on GitHub, or opened in [Obsidian](https://obsidian.md) for a visual graph of how everything connects.

## What's in here

- `wiki/` — one page per CSF Function, Category, and Subcategory, cross-linked to each other and to related Simply Cyber video highlights and Gerry's Daily Cyber Threat Briefing highlights.
- `raw/` — the source material the wiki is generated from (NIST CSF text, video summaries, briefing highlights). See `CONTRIBUTING.md` if you want to understand or extend the generation process.

## How to browse

- On GitHub: start at [`wiki/GV/_index.md`](wiki/GV/_index.md) and follow the links.
- In Obsidian: open this `CSF_Wiki` folder as a vault to see the full link graph.

## How to contribute a source

Drop a markdown or text file into the matching `raw/` subfolder (NIST material, a Simply Cyber summary, or a threat-briefing highlight) and open a PR. See `CONTRIBUTING.md` for exactly how new material gets linked into existing wiki nodes.

## Origin

This grew out of an internal planning issue — a second brain for the CSF, built on Andrej Karpathy's "LLM wiki" pattern: raw folder in, Claude Code reads everything and builds the linked markdown wiki, no vector database or extra infrastructure required.
