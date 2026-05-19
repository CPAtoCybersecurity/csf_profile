# Load Data with Claude Cowork

Use Claude as a co-worker to drive the Jira and Confluence UI for you — Claude clicks the buttons, types the values, configures the schema, and imports the CSVs while you supervise. Best when you're not a Jira admin by reflex and want to skip the manual click-through.

**Prerequisites:**
- [`ATLASSIAN-SETUP.md`](ATLASSIAN-SETUP.md) completed (Confluence space + Jira project shell exist)
- Either **Claude for Chrome** (browser extension) or a **claude.ai** session with **computer use** enabled (Sonnet 4.6+)
- You're logged into your Atlassian site in the same browser

This file gives you two paste-ready prompts — one per Claude surface — plus a checkpoint pattern so Claude pauses before any irreversible action.

---

## How cowork is different from manual or CLI

| Aspect | Manual | Claude cowork | CLI |
|---|---|---|---|
| Who clicks | You | Claude (you watch) | Nobody (script) |
| Admin expertise needed | High | Low | Medium |
| Reproducibility | Medium | Medium (depends on prompt) | High |
| Speed first time | Slow | Medium | Slow setup, fast after |
| Speed Nth time | Same as first | Fast (refined prompt) | Fastest |
| Requires API token | No | No | Yes |
| Requires Node | No | No | Yes |
| Requires Claude subscription | No | Yes | No |
| Works in air-gapped env | Yes | No | Yes (with self-hosted Atlassian) |

Cowork is the **middle option** — minimal setup, AI assistance, you stay in the loop. The trade-off is brittleness: if Atlassian changes its UI, the prompt drifts.

---

## Surface 1 — Claude for Chrome

Claude for Chrome runs as a browser extension. It can see what's on your screen, click buttons, fill forms, and read responses.

### Setup

1. Install the **Claude** Chrome extension (search Chrome Web Store for "Claude")
2. Sign in with your Anthropic account
3. Confirm computer-use permission is enabled

### How to use the prompt below

1. Open Jira in a tab. Make sure you're logged in.
2. Open the Claude side panel (extension icon)
3. Paste the prompt
4. Stay at the keyboard — Claude will pause at checkpoints

### Prompt — paste into Claude for Chrome

```
You are going to help me configure my Jira project for CSF Profile assessments.
The project already exists. I need you to add custom fields and set up screens.

Repo I'm working from: github.com/CPAtoCybersecurity/csf_profile
Folder: SET_UP_IN_ATLASSIAN/

CONTEXT FILES YOU SHOULD READ FIRST:
- SET_UP_IN_ATLASSIAN/LOAD-DATA-MANUALLY.md — Part B "Jira: custom fields for the work papers"
  (it has the exact field names, types, and screen-order I want)
- SET_UP_IN_ATLASSIAN/templates/JIRA-Assessments.csv — first row has the column headers
  these custom fields must match

WHAT I WANT YOU TO DO, IN ORDER:

1. Confirm the Jira project I'm currently looking at. Tell me its name and key. STOP and wait for my confirmation before continuing.

2. Create the quarterly scoring fields. For each of Q1, Q2, Q3, Q4, create three custom fields:
   - "QX Target Score" — Number
   - "QX Actual Score" — Number
   - "QX Observations" — Paragraph
   12 fields total. STOP after Q1 (three fields created) and show me the result before continuing with Q2-Q4.

3. Create the metadata fields:
   - Test Procedures — Paragraph
   - Testing Status — Single-select with options: Not Started, In Progress, Submitted, Complete, Needs Rework
   - Assessment Methods — Checkboxes: Examine, Interview, Test
   - Compliance Requirement — Short text
   - Control Link — URL
   - Artifacts — Short text
   - Remediation Action Plan — Paragraph
   - Root Cause — Paragraph
   - Vulnerability — Short text
   STOP and show me the result before moving to step 4.

4. Add the fields to the screen for the "Work paper" issue type, in the order they appear in
   SET_UP_IN_ATLASSIAN/LOAD-DATA-MANUALLY.md Part B.

CHECKPOINT RULES — these are non-negotiable:
- STOP before any action that creates more than 5 new things at once.
- STOP before any action that deletes or modifies existing data.
- If a step fails, STOP — do not retry blindly. Show me the error.
- If the Jira UI looks different from what you expect, STOP and ask me to confirm we're in the right place.
- At every STOP, wait for me to type "go" before continuing.

Confirm you understand by listing the steps back to me, then start at step 1.
```

---

## Surface 2 — claude.ai with computer use

claude.ai's computer-use mode runs Claude inside a sandboxed virtual browser. You drive it from the chat panel; it shows you the screen.

### Setup

1. Open <https://claude.ai/> in a recent Chrome or Safari
2. Start a new chat with Sonnet 4.6 or newer
3. Enable **Computer use** in the chat settings (or upload the prompt as a project with computer-use tools enabled)

### Limitation versus Chrome extension

Computer use runs in a sandboxed browser — you'll need to **log into Atlassian inside the sandbox** at the start of the session. Sessions don't persist; you log in once per chat.

### Prompt — paste into a new claude.ai chat with computer use enabled

```
I want you to configure my Jira project for CSF Profile assessments. You'll
drive my browser via computer use. I'll watch and confirm at checkpoints.

FIRST: navigate to https://[my-site].atlassian.net/jira and pause. I'll log
in manually inside your sandbox.

THEN follow the same plan as the Chrome extension version of this prompt
(repo: github.com/CPAtoCybersecurity/csf_profile, file:
SET_UP_IN_ATLASSIAN/LOAD-DATA-MANUALLY.md, Part B for the field list).

Steps:
1. Confirm the project I'm looking at — name and key. STOP, wait for "go".
2. Create the 12 quarterly fields (Q1-Q4 × Target/Actual/Observations).
   STOP after Q1, show me, wait for "go".
3. Create the 9 metadata fields (Test Procedures, Testing Status, Assessment
   Methods, Compliance Requirement, Control Link, Artifacts, Remediation
   Action Plan, Root Cause, Vulnerability). STOP, show me, wait for "go".
4. Add fields to the Work paper screen in the order from LOAD-DATA-MANUALLY.md
   Part B section B.3.

CHECKPOINT RULES:
- STOP before creating more than 5 things at once.
- STOP before any delete or modify.
- STOP on errors — do not retry.
- STOP if the UI looks unexpected.
- At every STOP, wait for "go".

When you're done with steps 1-4, hand control back to me so I can run the
CSV import myself (instructions: SET_UP_IN_ATLASSIAN/LOAD-DATA-MANUALLY.md
Part C). I do the import manually so I see exactly what's being uploaded.

Confirm you understand and start at step 1.
```

---

## After Claude finishes the schema

The CSV import itself is fast and worth doing yourself (one mistake here can create thousands of issues). Don't ask Claude to do the import — it's the highest-blast-radius step in this whole flow.

Drive [`LOAD-DATA-MANUALLY.md`](LOAD-DATA-MANUALLY.md) **Part C** yourself.

---

## Why the checkpoint pattern matters

Claude is good at clicking. Claude is **not** good at noticing that it just deleted your custom field by accident. The checkpoints exist because:

| Risk | Mitigation |
|---|---|
| Wrong project selected | Step 1 confirms project, you say "go" |
| Mass field creation goes sideways | After Q1 (3 fields), you eyeball before Q2-Q4 |
| Schema name typo persists across 12 fields | Q1 review catches it |
| Atlassian UI changed | Unexpected-UI checkpoint surfaces it |
| Error retry creates duplicates | No-blind-retry rule |

The cost of a checkpoint pause is 10 seconds. The cost of cleaning up 50 wrongly-named custom fields is an evening.

---

## When cowork is the wrong tool

- You're doing this for the 5th time → use the CLI. The script is more reproducible than a prompt.
- You need true bidirectional sync (Jira → CSF Profile) → use the CLI.
- You're configuring a production audit environment → use the CLI or manual. AI in the loop is not appropriate for SOX-grade work papers.
- Your Atlassian site has strict change-tracking → manual gives you the cleanest audit trail.

---

## Useful follow-ups for the same Claude session

After the schema is set, you can keep the cowork session open for ad-hoc tasks:

- "Pull all my open Findings and group them by Q1 Actual Score"
- "Find any work papers where Testing Status is Complete but Q4 Actual Score is empty — those are inconsistent"
- "Generate a Confluence page summarizing Q4 results from the work papers"

These are valid cowork use cases because they're read-heavy or generate-once-then-review. The risk profile is much lower than schema-creation.
