# Business Case — 2026 Alma Security CSF Assessment

**Document date:** December 2025
**Prepared by:** Steve Mercer, Director, Internal Audit
**Executive sponsor:** Priya Raman, Audit Committee Chair
**Management sponsor:** Gerry Callahan, CISO
**Decision body:** Audit Committee of the Board

> This is a fictional artifact created for educational purposes by Simply Cyber Academy. Canonical facts: see `ASSESSMENT_CATALOG/0_Methodology/Alma-Fact-Sheet.md`.

---

## 1. The Ask

The Audit Committee is asked to **approve a recurring annual NIST CSF 2.0 assessment of Alma Security's cybersecurity program, executed quarterly by Internal Audit, at a FY2026 cost of $142,000**, with first fieldwork beginning January 1, 2026 and the first report (IA-2026-001) issued by March 20, 2026.

## 2. Why Now

1. **Series B governance conditions (Feb 2025).** The financing terms require a standing Internal Audit function and periodic independent evaluation of the security program. This assessment is how that obligation is met for cybersecurity.
2. **Post-incident credibility.** After the two 2024 incidents (INC-2024-01 S3 exposure; INC-2024-02 SSH key compromise), management rebuilt the security program under a new CISO. The board currently has **no independent evidence** of whether that rebuild works — only management's own KPI reporting.
3. **Enterprise sales and the Apple Passkeys integration (June 2026).** Enterprise customers and the Passkeys partnership both demand demonstrable security maturity. An assessed CSF profile with quarterly trend data is directly usable in customer due-diligence responses.
4. **Trust recovery is measurable only if independently scored.** Public trust (goal: 90%+ by January 2027) is Alma's most exposed metric; independently assessed progress is more credible than self-attestation.

## 3. Scope

- **Framework:** NIST CSF 2.0, all six functions (GV, ID, PR, DE, RS, RC).
- **Population:** the 38 in-scope control implementations in `alma-controls.csv` (40 assessed implementations in Q1), spanning AWS production/staging, the Redwood City Windows domain, and corporate SaaS.
- **Cadence:** quarterly scoring cycles across CY2026; Q1 fieldwork Jan 1 – Mar 10, 2026.
- **Method:** Examine / Interview / Test per the [Scoring Rubric and Methodology](../0_Methodology/Scoring-Rubric-and-Methodology.md), scored on the 0–10 rubric against board-approved targets.
- **Out of scope:** financial reporting controls, satellite co-working spaces, customer-side product configuration.

## 4. Cost

| Line | FY2026 |
|---|---|
| Internal Audit staff allocation (Mercer 0.35 FTE, Garza 0.50 FTE) | $96,000 |
| External technical testing support (sampling-based re-performance, Q2 and Q4) | $28,000 |
| Independent QA review (D. Whitfield, per-report) | $12,000 |
| Tooling and evidence management (ServiceNow module, workpapers) | $6,000 |
| **Total** | **$142,000** |

For context: $142K is 2.7% of the FY2026 security budget ($5.3M) and roughly 0.75% of the revenue at risk in a repeat trust incident (FY2024's incidents coincided with churn that cost an estimated $2.1M in ARR).

## 5. Alternatives Considered

| Option | Cost | Why not |
|---|---|---|
| External firm, annual point-in-time assessment | $180–250K/yr | No quarterly cadence; no internal capability built; exceeds Series B intent (standing IA function) |
| Self-assessment by the security team | ~$40K effort | Fails independence — the team would grade its own rebuild; unusable for board assurance and customer due diligence |
| Defer to 2027 (post-SOC 2) | $0 now | Leaves the board without independent security evidence through the Passkeys launch and Europe expansion — the highest-exposure year in company history |

## 6. Benefits and Success Measures

- Independent, quarterly, board-reported scoring of the security program against explicit targets (first cycle: overall target 5.0 — Minimally Acceptable).
- A findings pipeline with management-owned action plans and tracked remediation (High findings remediated within 90 days).
- Reusable assurance artifact for enterprise due diligence and the Passkeys partner review.
- Trend evidence for the trust-recovery narrative (TTD 81h → 9h already; target <4 min by Jan 2027).

## 7. Risks of the Assessment Itself

Assessment fatigue on a 15-person security team (mitigated by sampling and quarterly spread); scope creep into SOC 2 preparation (mitigated by the scope statement); independence impairment (mitigated by the safeguards in the [Independence Statement](../0_Methodology/Scoring-Rubric-and-Methodology.md#6-independence-statement)).

## 8. Decision Requested

The Audit Committee is asked to vote to:

1. **Approve** the 2026 Alma Security CSF Assessment as scoped (§3) and budgeted (§4).
2. **Adopt** the 0–10 scoring rubric and methodology as the assessment standard.
3. **Direct** management to remediate High-rated findings within 90 days of report issuance, with status reported at each committee meeting.

*Requested approval date: December 18, 2025 committee meeting.*
