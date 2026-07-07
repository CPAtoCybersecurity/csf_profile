# Alma Security — CISO Self-Assessment, Q3 2026 Cycle

**Assessment:** 2026 Alma Security CSF Assessment — Q3 CISO management self-assessment
**Prepared by:** Leila Haddad, Security GRC Lead — approved by Gerry Callahan, CISO
**Fieldwork:** July 1 – September 19, 2026 · **Scope:** same 106-subcategory profile as Q2 (all quarters live in `alma-ciso-assessment-2026.csv`)
**Concurrence:** all 37 IA-overlap implementations match Internal Audit's Q3 record exactly (script-verified)

---

## 1. Function scores — Q2 → Q3

| Function | Q2 | Q3 | Movement | Status vs. minimum (5.0) |
|---|---|---|---|---|
| GOVERN (GV) | 5.06 | **5.32** | +0.26 | above |
| PROTECT (PR) | 4.48 | **5.27** | +0.79 | **crossed the minimum this quarter** |
| DETECT (DE) | 3.64 | **4.18** | +0.54 | below |
| RESPOND (RS) | 3.62 | **4.00** | +0.38 | below |
| IDENTIFY (ID) | 3.71 | **3.98** | +0.27 | below |
| RECOVER (RC) | 3.00 | **3.63** | +0.63 | below |
| **Overall** | **4.19** | **4.64** | **+0.45** | below |

Subcategories below minimum: **74 → 53**.

## 2. What landed this quarter

- **ROC charter approved** by the Audit Committee (August), and the **weekly risk-operations cadence went live in September** — the roadmap's Step 0 and the front edge of Step 2. GOVERN's gains are mostly measurement maturing (GV.OV, GV.RM rows moving 5 → 5.5–6 as metrics reviews produce decisions, not dashboards).
- **MFA Rollout completed** ($80K) — the largest single driver of PROTECT's +0.79; PR.AA authentication rows moved up a half to a full point. The INC-2024-02 shared-credential class is now materially narrower.
- **September incident-response tabletop** — first since the 2024 incidents — lifted RS.MA/RS.CO; findings from it feed the ID.IM improvement loop, which is now actually converting exercises into control changes.
- **Detection-rule tuning inside the ROC cadence** — TTD self-measured at ~6 hours (from 9h in Q2; still hours-grade, still far from the <4 min Jan 2027 commitment).

## 3. What slipped — said plainly

- **The asset-inventory program (R4) missed its August target.** ASM discovery scans ran and found what discovery always finds — the known asset count rose ~30% — but ownership assignment and criticality mapping stalled near 55% coverage against the roadmap's 70% Step-1 exit criterion. **Step 1 is not exited.** Revised target: March 2027. This is the reported-risk spike the board was pre-briefed on: IDENTIFY's modest +0.27 *understates* progress because the denominator grew.
- **R2 perimeter monitoring** remains partial for the same reason — continuous coverage needs the inventory it monitors. The IA record holding DE.CM-01 at 4 reflects exactly this.

## 4. Findings status (from the Q2 report)

F-01 asset inventory: **open, slipped** (now the program's critical path). F-02 recovery testing: open — first production restore test scheduled November. F-03 detection depth: improving (TTD 9h→6h); 24/7 coverage still not live. F-04 perimeter: partially mitigated by ASM discovery; continuous monitoring pending. F-05 staffing: two offers accepted, October starts; federated remediation into engineering squads live since September. F-06 identity hygiene: **substantially remediated** (MFA complete). F-07 encryption: on track for Q4. F-08 TPRM metrics: first cycle-time measures in the September ROC review. F-09 improvement loops: functioning (tabletop → register). F-10 strengths: held.

## 5. Carry into Q4

Encryption upgrade completion, first production restore test, 24/7 alerting rota, and the two October hires. The honest headline: **momentum is real, and the hardest structural fix (inventory) is the one that slipped** — exactly the inverted-leverage risk the ROC roadmap named.
