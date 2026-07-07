# Alma Security — CISO Self-Assessment, Q4 2026 Cycle (Year-End)

**Assessment:** 2026 Alma Security CSF Assessment — Q4 CISO management self-assessment, closing the first full annual cycle
**Prepared by:** Leila Haddad, Security GRC Lead — approved by Gerry Callahan, CISO
**Fieldwork:** October 1 – December 11, 2026 · **Scope:** same 106-subcategory profile (all four quarters now populated in `alma-ciso-assessment-2026.csv`)
**Concurrence:** all 37 IA-overlap implementations match Internal Audit's Q4 record exactly (script-verified)

---

## 1. The full-year picture — Q1 baseline to year end

| Function | Q2 | Q3 | Q4 | Q4 target | Rating (70% rule) |
|---|---|---|---|---|---|
| GOVERN (GV) | 5.06 | 5.32 | **5.63** | 5.29 | **Satisfactory** — above target |
| PROTECT (PR) | 4.48 | 5.27 | **5.59** | 5.50 | **Satisfactory** — above target |
| RESPOND (RS) | 3.62 | 4.00 | **4.50** | 5.31 | Needs Improvement (85%) |
| DETECT (DE) | 3.64 | 4.18 | **4.41** | 5.00 | Needs Improvement (88%) |
| IDENTIFY (ID) | 3.71 | 3.98 | **4.33** | 5.10 | Needs Improvement (85%) |
| RECOVER (RC) | 3.00 | 3.63 | **4.31** | 5.13 | Needs Improvement (84%) |
| **Overall** | **4.19** | **4.64** | **5.00** | 5.26 | **Needs Improvement** |

Subcategories below minimum: **74 (Q2) → 53 (Q3) → 36 (Q4)**. Year-end overall opinion moves from **Unsatisfactory to Needs Improvement**: two functions are now Satisfactory, none is Unsatisfactory, and no finding is open without a funded, dated plan.

## 2. What landed in Q4

- **Data Encryption Upgrade completed** ($95K) — PR.DS rows moved up; combined with Q3's MFA completion, both incident-lineage protection gaps (F-06, F-07) closed inside the year.
- **First production restore test (November)** — partial success: PostgreSQL restore met its objective; the on-prem Windows domain missed its RTO. **December full recovery tabletop** completed. RECOVER's +0.68 is real but earned the honest way — RC is still the weakest function, and the domain-recovery miss is a named 2027 workstream.
- **24/7 alerting rota live** (IR Enhancement, $150K) — after-hours pages now route to a staffed rotation, not a single on-call. TTD self-measured ~4 hours; the <4-minute commitment remains a January 2027 test, not a claim.
- **Two hires started October** (R1 partially closed); federated remediation matured — engineering squads now clear their own queues, with burndown ≥ arrival on high-tier findings in October and November (the roadmap's Step-2 exit criterion, met two months running).

## 3. What did not land — carried into 2027

- **F-01 / R4 asset inventory — still open.** Coverage reached ~65% by December against the 70% Step-1 exit criterion; ownership mapping remains the bottleneck. Revised target March 2027. The IA record holding ID.AM rows at 3 all year is the honest reading: **Step 1 of the ROC roadmap is not exited, and it remains the program's critical path.**
- **R2 continuous perimeter monitoring** — dependent on the same inventory; bimonthly-plus-ASM-discovery is better, not done.
- **The 2027 commitments stand un-gamed:** TTD <4 min (Jan), TTR-CJC <16h and TTR-C <3 days (Aug), trust score 90%+ (Jan). None is claimed met; all trend in the right direction.

## 4. Roadmap reconciliation (Steps 0–2)

| Roadmap step | Exit criterion | Year-end verdict |
|---|---|---|
| Step 0 — Charter + appetite | Charter approved; appetite statement board-seen | **Met** (August / September) |
| Step 1 — See everything once | ≥70% asset coverage with owners; orphans <10% | **Not met** — 65%, revised Mar 2027 |
| Step 2 — Weekly risk operations | Burndown ≥ arrival two consecutive months | **Met** (Oct–Nov) |

Step 3 (loss-exceedance quantification for the FY2027 budget) starts January as planned; its first deliverable is the dollars-at-risk case the board asked for.

## 5. Year-one verdict

The program did what the June board deck promised, in the order it promised — governance first, identity and protection next, detection/response/recovery climbing but unfinished — with one material slip (inventory) that was named early, re-forecast openly, and never papered over. The 2027 assessment cycle inherits a profile where the remaining red is concentrated, funded, and owned.

---

*Data integrity: Q1/Q2 columns and all framework text are byte-identical to the Q2 release (frozen-column drift check: 0 rows). All 17 Q3/Q4 validation checks and the original 16 structural checks pass.*
