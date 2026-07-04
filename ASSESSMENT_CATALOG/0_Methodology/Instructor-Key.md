# Instructor Key — Alma Security Scenario

**Audience:** instructors and content authors. This file holds scenario-design material that intentionally does NOT belong in the student-facing company documents: the SPQA framing that originally shaped the case, compensation data, and design rationale. Students assess the company; instructors maintain the fiction.

---

## 1. Scenario Lineage (SPQA)

The Alma Security case was originally authored as an **SPQA** context document (State, Policy, Questions, Action — Daniel Miessler's pattern for giving an AI system durable company context, see the [TELOS project](https://github.com/danielmiessler/Telos)). The original backgrounder doubled as an AI-context file: it defined mission, goals (G1–G8), KPIs (K1–K5), security goals (SG1–SG8), security KPIs (SK1–SK5), strategies (STS1–STS4), and a streaming "Activity" update convention.

That framing has been removed from the student-facing backgrounder (a company profile now) because a case-study artifact should read like something a real company would produce. The structured IDs survive as canonical identifiers (see [Canonical Schema](Canonical-Schema.md) §1); the [Alma Fact Sheet](Alma-Fact-Sheet.md) is now the single source of truth that the SPQA document used to be.

### Legacy SPQA goal/KPI blocks (preserved for authoring reference)

- **Company goals:** G1 20% market share by Jan 2027 · G2 10,000 active customers by Jan 2027 · G3 customer trust 90%+ by Jan 2027 · G4 churn <5% by Aug 2026 · G5 launch Europe by Aug 2026 · G6 launch India by Nov 2026 · G7 Mood-monitor integration by Feb 2026 · G8 Apple Passkeys partnership by Jun 2026. (Weighting rule: each goal roughly half the importance of the one before it.)
- **Company KPIs:** K1 market share % · K2 active customers · K3 churn % · K4 launched-in-Europe · K5 launched-in-India.
- **Security goals:** SG1 secure customer data (especially biometric) · SG2 protect IP · SG3 TTD <4 min by Jan 2027 · SG4 public trust · SG5 TTR-CJC <16h by Aug 2027 · SG6 TTR-C <3 days by Aug 2027 · SG7 Apple Passkey integration audit by Feb 2027 · SG8 Passkey vuln remediation by Feb 2027.
- **Security KPIs:** SK1 TTD (min) · SK2 TTI (min) · SK3 TTR-CJC (h) · SK4 TTR-C (h) · SK5 Public trust score.
- **Strategies:** STS1 hire 5 A-tier professionals · STS2 ASM solution · STS3 detection & response investment · STS4 asset inventory integrated with ASM · *(added post-canon)* STS5 transparency/PR program · STS6 TPRM program.

## 2. Compensation Data (instructor-only)

Moved out of the backgrounder — real company profiles do not publish individual salaries, and students kept citing them in deliverables. Useful for staffing-cost exercises (R1 remediation costing, business-case math).

| Team member | Team | Skills | Pay | Location |
|---|---|---|---|---|
| Nadia Khan | Detection & Response | D&R (Expert), AWS (Strong), Python (Expert), Kubernetes (Basic), Postgres (Basic) | $249K | Redwood City |
| Chris Magann | Vulnerability Management | VM (Expert), AWS (Strong), Python (Basic), Postgres (Basic) | $212K | Redwood City |
| Tigan Wang | Vulnerability Management | VM (Expert), AWS (Strong), Python (Basic), Postgres (Basic) | $217K | Redwood City |

Instructor guidance for R1 costing: 5 A-tier hires at ~$220–250K base each ≈ $1.4–1.6M/yr fully loaded — students should discover that STS1 is the single largest security investment and weigh it against outsourcing (a deliberate discussion point in the business case).

## 3. Design Rationale (why the canon is shaped this way)

- **Founded 2021** (not 2023): makes the FY2023 120-FTE / FY2024 200-FTE / 2026 300-FTE growth curve and the 2024 incidents chronologically possible.
- **Two 2024 incidents** (INC-2024-01 S3 exposure, INC-2024-02 SSH key): give concrete, teachable root causes for R2/R3/R4/R5 and for the 81-hour TTD baseline. Every risk in the register traces to observable history.
- **Internal Audit as assessor** (not an external firm): creates the independence teaching moment (§6 of the [methodology](Scoring-Rubric-and-Methodology.md)) and is justified in-fiction by Series B governance conditions.
- **Intentional weaknesses are features:** shared SSH keys, the un-2FA'd AWS root account, the Windows 2012 fileserver, and no-24/7 monitoring are deliberately imperfect — they generate findings. Do not "fix" them in content updates.
- **Scores cluster 2.5–5.5 in Q1 2026** by design: a one-year-old rebuilt program should hover around Minimally Acceptable, leaving quarterly improvement headroom for Q2–Q4 content.

## 4. Common Authoring Mistakes (what the T2 canon lock fixed)

Placeholder names (Gerry/Jane/John/OG) without identities; three divergent risk-register mappings; founded-date vs incident-year impossibilities; tool-stack drift toward famous vendor names (Splunk/CrowdStrike/Okta) that the fiction never adopted; the lead assessor appearing inside his own assessment scope. When authoring new content, start from the [Alma Fact Sheet](Alma-Fact-Sheet.md) and the [Canonical Schema](Canonical-Schema.md) — never from memory of older files.
