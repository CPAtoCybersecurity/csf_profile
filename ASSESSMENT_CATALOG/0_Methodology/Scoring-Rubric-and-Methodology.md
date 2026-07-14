# Scoring Rubric and Assessment Methodology

**Status:** Authoritative (resolves issue #235)
**Applies to:** every score in `4_Observations/`, `alma-assessments.csv`, and `6_Audit_Report/`. There is exactly ONE scale. Any file using a 1–5 scale, a percentage-as-score, or a maturity tier in place of this rubric is noncanon and gets corrected.

---

## 1. The 0–10 Scale — Anchor Definitions

Scores are assigned per control implementation, in increments of 0.5. Each anchor describes what an assessor must observe to justify the score.

| Score | Anchor — what the assessor observed |
|---|---|
| **0** | The activity does not exist. No policy, no process, no evidence anyone performs it. |
| **1** | The activity is acknowledged (mentioned in a policy or plan) but is not performed. No evidence of execution. |
| **2** | The activity is performed occasionally, ad hoc, by individual initiative. No defined process; outcomes depend entirely on who does it. |
| **3** | A process is defined (documented procedure or well-understood practice) but execution is unreliable — evidence shows gaps, missed cycles, or significant rework. |
| **4** | The process executes regularly but with material weaknesses: incomplete coverage of scope, missing evidence for some cycles, or known exceptions without treatment. |
| **5** | The process executes consistently across its full scope with minor flaws. Evidence exists for the assessment period. Exceptions are known and tracked. **This is the minimum passing level.** |
| **6** | Consistent execution plus measurement: the control has defined metrics/indicators, and the owner reviews them and acts on drift. |
| **7** | Measured and improving: trend data shows the control's effectiveness improving over multiple periods; improvement actions close on schedule. |
| **8** | Control effectiveness is high AND the cost/effort is proportionate to the risk it treats. Automation applied where sensible. Sustained over 2+ periods. |
| **9** | Control investment exceeds what the treated risk justifies — resources spent here are visibly missing elsewhere in the program. |
| **10** | Control burden materially impedes the business (people route around it, or its cost is grossly disproportionate). Over-engineering is a finding, not an achievement. |

Scores of 9–10 are deliberately labeled as *waste*: the rubric follows the "just right" philosophy — the goal is proportionate security, not maximum security.

## 2. Maturity Bands

Bands are contiguous (no gaps). These replace all previous band tables.

| Score range | Band | Meaning |
|---|---|---|
| 0 – 1.9 | **Insecurity** | Rarely or never done. Not enough security. |
| 2.0 – 4.9 | **Some Security** | Done sometimes, unreliably. Not enough security. |
| 5.0 – 5.9 | **Minimally Acceptable** | Done consistently with minor flaws. Just right (floor). |
| 6.0 – 6.9 | **Optimized** | Done consistently with high effectiveness and quality. Just right. |
| 7.0 – 7.9 | **Fully Optimized** | Consistently excellent, measured, improving. Just right. |
| 8.0 – 10.0 | **Excessive Security (Waste)** | Cost or burden disproportionate to risk. Too much security. |

Boundary rule: a score of exactly X.0 belongs to the band that starts at X.0 (5.0 is Minimally Acceptable, not Some Security).

## 3. Ratings Derived from Scores

**Function rating** (per CSF function, used in the audit report):

| Rating | Criteria |
|---|---|
| Satisfactory | Function average ≥ its target score |
| Needs Improvement | Function average ≥ 70% of target but below target |
| Unsatisfactory | Function average < 70% of target |

**Overall opinion:** determined by function-level ratings and finding severity, never by the overall average alone — Satisfactory (all functions Satisfactory, no open Critical/High findings); Needs Improvement (any function Needs Improvement or any open High finding, no function Unsatisfactory); Unsatisfactory (any function Unsatisfactory or any open Critical finding).

**Finding risk ratings** (Critical / High / Medium / Low) follow the definitions in the audit report Appendix B.

## 4. Scope Statement

- **Entity:** Alma Security, Inc. — all corporate and product environments (AWS production and staging, Redwood City on-prem Windows domain, corporate SaaS).
- **Framework:** NIST CSF 2.0, all six functions (GV, ID, PR, DE, RS, RC).
- **Population:** the 38 in-scope control implementations enumerated in `1_Case_Study/alma-controls.csv`, plus assessed implementation examples documented in `2_Controls/` (40 assessed in Q1 2026).
- **Period:** calendar year 2026, assessed quarterly; Q1 fieldwork January 1 – March 10, 2026.
- **Out of scope:** financial reporting controls (covered by the financial statement audit), physical security of co-working satellite spaces, and customer-side configuration of Alma's product.
- **Scope changes** require Audit Committee approval and are logged in the assessment record.

## 5. Sampling Guide

Testing uses attribute sampling appropriate to a 300-person company; the aim is evidence sufficiency, not statistical projection.

| Method | Population size | Minimum sample |
|---|---|---|
| Examine (documents, configs, records) | ≤ 10 items | All items |
| Examine | 11 – 50 items | 5 items or 25%, whichever is greater |
| Examine | 51 – 250 items | 15 items |
| Examine | > 250 items (e.g. 300 endpoints, all employees) | 25 items |
| Interview | per control | Control owner + ≥1 operator (someone who performs the activity, not only the accountable manager) |
| Test (re-performance / technical validation) | recurring control executions | 3 executions across the quarter (beginning / middle / end) |

Rules:
- Samples are selected by the **assessor**, never by the auditee ("provide your three best examples" is not a sample).
- Random or judgmental selection is documented per test in the observation's Evidence Reviewed section; the sampling walkthrough procedure (`5_Artifacts/Procedures/PROC-sampling-walkthrough.md`) shows the worked method.
- One deviation in a sample = the control cannot score above 4 unless the deviation is isolated, root-caused, and remediated with evidence within the period.
- Evidence must originate in the assessment period (stale evidence scores as missing).

## 6. Independence Statement

The 2026 Alma Security CSF Assessment is performed by Alma Security's **Internal Audit function** — the model chosen over an external firm because Series B governance conditions (Feb 2025) require a standing IA capability, and quarterly cadence makes external fieldwork uneconomical at this stage. Independence is preserved structurally:

1. **Reporting lines.** Internal Audit (Steve Mercer, Director; Omar Garza, Senior IT Auditor) reports functionally to the **Audit Committee of the Board** (chair: Priya Raman) and administratively to the CFO. Internal Audit does not report to the CISO or any assessed control owner.
2. **No self-review.** Assessors do not own, operate, design, or remediate any control in scope. They are never listed as scoped personnel in a test procedure, never named as control owner or stakeholder in `alma-controls.csv`, and never assigned as recommendation owners in observations. Recommendations are owned by management (typically the CISO or the relevant control operator).
3. **Quality review.** Every quarterly report receives an independent QA review (Dana Whitfield, contract QA reviewer, engaged by the Audit Committee) before issuance.
4. **Impairment disclosure.** Any threat to independence (prior involvement in a control's design, personal relationship with an owner, management pressure on a rating) is disclosed in the report's scope section. If Internal Audit's objectivity on a domain is impaired, that domain's assessment is procured externally for the cycle.
5. **Authority.** The Internal Audit charter (approved by the Audit Committee) grants unrestricted access to personnel, systems, and records for assessment purposes.

The word "Independent" in "Independent Assessment Opinion" refers to this structure. An assessor who appears anywhere in scope as an operator — as previously occurred when the lead assessor was also listed among scoped personnel — is a violation of this statement and must be corrected on discovery.

## 7. Method Definitions

Every observation documents which of the three NIST SP 800-53A-style methods were used. Canonical labels are exactly: **Examine**, **Interview**, **Test** ("Inquiry" and other synonyms are noncanon).

---

*Created to resolve [#235]. Companion documents: [Canonical Schema](Canonical-Schema.md) (#233), [Alma Fact Sheet](Alma-Fact-Sheet.md) (#234).*
