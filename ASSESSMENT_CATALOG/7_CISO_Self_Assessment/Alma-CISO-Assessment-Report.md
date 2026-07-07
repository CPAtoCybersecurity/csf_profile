# Alma Security — CISO Management Self-Assessment, NIST CSF 2.0

**Assessment:** 2026 Alma Security CSF Assessment — Q2 CISO management self-assessment
**Prepared by:** Leila Haddad, Security GRC Lead — approved by Gerry Callahan, CISO
**Fieldwork:** April 1 – June 19, 2026 · **Scope:** all 106 CSF 2.0 subcategories (one representative implementation example each)
**Data file:** `alma-ciso-assessment-2026.csv` (imports directly into the CSF Profile Assessment Database)

---

## 1. Purpose and independence

This is the CISO organization's **management self-assessment** across the full NIST CSF 2.0 framework. It complements — and does not replace — Internal Audit's independent Q1 2026 assessment (IA-2026-001, Steve Mercer), which covered the 38 in-scope control implementations. Where scopes overlap, this assessment concurs with the IA Q2 record on all 37 overlapping implementations (exact score match, verified by script) — management found no evidence to dispute Internal Audit's positions; the 68 subcategories IA has not yet examined are management's first documented look. Internal Audit remains organizationally independent of this exercise.

## 2. Methodology

- **Scale:** the 0–10 AKYLADE rubric in 0.5 increments (5.0 = minimum passing; 6 = measured; 7 = improving; 8+ = disproportionate cost — *waste, not achievement*). No implementation scored 8 or above.
- **Evidence:** each row records what was examined, who was interviewed, and what was tested, per the sampling guide (assessor-selected samples; owner + operator interviews).
- **Representative-example scoping:** one implementation example per subcategory, chosen for fit to Alma's canonical stack; the full example catalog remains available for deep-dives.
- **Quarter columns:** Q1 = IA baseline where assessed; Q2 = this assessment; Q3/Q4 reserved for the remaining 2026 cycles.

## 3. Results — function scores (Q2 actual vs. target)

| Function | Q2 Actual | Q2 Target | % of Target | Rating |
|---|---|---|---|---|
| GOVERN (GV) | **5.06** | 5.52 | 92% | Needs Improvement (borderline Satisfactory) |
| PROTECT (PR) | **4.48** | 5.59 | 80% | Needs Improvement |
| IDENTIFY (ID) | **3.71** | 5.19 | 72% | Needs Improvement |
| DETECT (DE) | **3.64** | 5.64 | 65% | **Unsatisfactory** |
| RESPOND (RS) | **3.62** | 5.31 | 68% | **Unsatisfactory** |
| RECOVER (RC) | **3.00** | 5.13 | 58% | **Unsatisfactory** |
| **Overall** | **4.19** | 5.43 | 77% | **Unsatisfactory** (3 functions below 70% of target) |

74 of 106 subcategories score below the 5.0 minimum; every one carries an action plan, remediation owner, and due date in the data file.

**Reading the shape:** eighteen months of rebuild under governance conditions attached to the Series B produced exactly the profile you'd expect — *the paper layer is fixed, the operational layer is funded but not yet landed*. GOVERN approaches target because policies, the risk register (R1–R6), board reporting, and TPRM structure were rebuilt first. The right side of the framework (DE/RS/RC) still reflects the 2024 reality that produced INC-2024-01 and INC-2024-02.

## 4. Findings

| # | Severity | Finding | CSF | Risk register / incident lineage |
|---|---|---|---|---|
| F-01 | **Critical** | No unified asset inventory: external hosts, S3 buckets, and endpoints are inventoried in fragments; criticality assignments incomplete. Every downstream control inherits this blindness. | ID.AM-01/02/05 | R4; enabling condition of both 2024 incidents |
| F-02 | **Critical** | Recovery capability is documented but effectively untested: no full restore exercise on production PostgreSQL; recovery of the on-prem Windows domain unproven; INC-2024-01 recovery was ad hoc. For a continuous-authentication product, recovery time is a customer-facing SLA risk. | RC.RP-*, RC.CO | R5 (trust); INC-2024-01 |
| F-03 | **High** | Detection depth and coverage: AWS-native telemetry (CloudTrail, GuardDuty, VPC Flow, DNS) with no 24/7 analysis; TTD 9h against the board-committed <4 min (Jan 2027). Off-hours dependence on PagerDuty paging of an understaffed team. | DE.AE-02/-06, DE.CM-01 | R3; INC-2024-02 (81h TTD baseline) |
| F-04 | **High** | Perimeter exposure management is bimonthly scanning without a results owner; unknown internet-facing assets persist between cycles. ASM project ($100K) is in flight but behind the register's 2026-06 target. | DE.CM-01, ID.AM-01 | R2; INC-2024-01 pattern |
| F-05 | **High** | Response capacity: the 15-person team absorbs D&R, VM, and security IT after the 2024 departures; incident roles beyond Nadia Khan's team are single-threaded. IR Enhancement ($150K) funds tooling, not depth. | RS.MA-*, GV.RR-01 | R1 |
| F-06 | **Medium** | Identity hygiene legacy: shared/long-lived developer credentials of the INC-2024-02 class are not fully eradicated; MFA Rollout ($80K) mid-flight; CyberArk vaulting is the bright spot but coverage of developer access paths is partial. | PR.AA-01/-05 | R-SSH-001 → R2/R4; INC-2024-02 |
| F-07 | **Medium** | Data-at-rest protections uneven: Data Encryption Upgrade ($95K) incomplete; S3 posture hardened post-incident but continuous verification of bucket policy drift is manual. | PR.DS-01/-10 | INC-2024-01 |
| F-08 | **Medium** | Third-party risk is structured (ServiceNow tiering, questionnaires) but unmeasured: no metrics on assessment cycle time, finding closure, or concentration risk in biometric-data processors. | GV.SC-* | R6 |
| F-09 | **Medium** | Improvement loops are young: lessons-learned exist for the 2024 incidents but ID.IM processes don't systematically convert exercises, incidents, and assessments into control changes. | ID.IM-* | all |
| F-10 | **Low** (positive) | Strengths to protect: rebuilt governance layer (GV ≈ target), Sigstore/Cosign build-pipeline signing, CyberArk PAM, and the measured TTD trend (81h → 9h) — these are the foundation the ROC roadmap builds on. | GV, PR.PS | — |

## 5. Where this goes

The pattern of findings is one problem wearing six coats: **risk is documented annually but not operated daily.** The companion documents translate this assessment into action:

- **`ROC-at-Alma-Roadmap.md`** — the process for establishing Risk Operations Center principles (charter → inventory → weekly CTEM cadence → quantification → automation), sequenced by leverage: F-01 (inventory) first because every other finding's remediation is unverifiable without it.
- **`Alma-Board-Presentation.html`** — the June 2026 board deck: results, the plan, and the decisions requested.

Q3 2026 self-assessment will re-score all 106 rows; success for the quarter is DETECT and IDENTIFY crossing 70% of target and zero Critical findings without a funded, dated plan.

---

*Upstream data note for the tool repo: `src/stores/defaultControlsData.js` still contains the noncanon phrase "2022 security events" (banned by Alma-Fact-Sheet §10) in at least GV.OC-02 Ex1's implementation description — the coherence lint covers the catalog but apparently not `src/stores/`. This CSV corrected it to the canonical 2024 incidents; worth a lint-scope fix + sweep in the app stores.*
