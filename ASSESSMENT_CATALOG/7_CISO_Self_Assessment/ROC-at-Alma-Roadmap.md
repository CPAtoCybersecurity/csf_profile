# Establishing Risk Operations Center Principles at Alma Security

**Author:** Gerry Callahan, CISO
**Date:** June 2026
**Audience:** Executive team and Board Audit Committee
**Companion documents:** 2026 Alma Security CSF Assessment (Q2 CISO self-assessment), Board Presentation (June 2026)

> *For learning purposes — Alma Security is a fictional company. This document is a training artifact from the Simply Cyber Academy CSF Profile scenario.*

---

## 1. Why a ROC, and why now

Alma sells trust. Our product is continuous authentication; our 2024 incidents (INC-2024-01, INC-2024-02) proved that a security failure at Alma is not an IT event — it is a revenue event, a valuation event, and a hiring event. We lost five senior security staff, our public trust score collapsed, and our Series B closed only with governance conditions attached.

Eighteen months into the rebuild, the CSF assessment shows the pattern clearly: **governance is rebuilt (GOVERN ≈ target), but operations lag** — asset visibility, detection speed, and recovery discipline all sit below minimum target. We know *what* our risks are (R1–R6 in ServiceNow); what we lack is a system that **operationalizes** them daily.

A Risk Operations Center is that system: *a people, process, and technology framework that operationalizes cyber risk management — aggregating risk signals across the enterprise, applying threat intelligence and business context, quantifying exposure in dollar terms, orchestrating remediation of the risks that matter most, and reporting outcomes to the board* (the operating pattern introduced in Jeff Pike's *Left of Boom: Introducing the ROC*). The question it exists to answer is the one our board actually asks: **"How much money do we stand to lose, and where should we invest to reduce that loss?"**

We do not have a SOC to convert, and that is an advantage. A SOC answers "is someone attacking us right now?" — reactive, right-of-boom. A ROC answers "where are we most exposed, and how do we systematically reduce that exposure?" — proactive, left-of-boom. At 300 employees with a 15-person security team, we build the fusion model natively: Nadia's Detection & Response function is our right-of-boom capability; the ROC is the left-of-boom operating system around it. We buy a second SOC analyst chair never; we build risk operations once.

## 2. The ROC principles we are adopting

Each principle is stated as an operating rule, not an aspiration (originating practitioners credited inline):

1. **Risk surface over attack surface** *(Richard Seiersen)*. We manage what a loss would *cost* — customer data value, biometric-template sensitivity, contract exposure — not just what an attacker can touch. Attack surface is the input; risk surface is the unit of management.
2. **The only language of risk is money** *(Richard Seiersen)*. Every risk we ask the executive team to fund is expressed as probability of loss × magnitude in dollars. "R2 is red" is banned; "R2 carries ~$X expected loss this year" is the format.
3. **"If everything is critical, nothing is critical"** *(Jonathan Trull)*. We adopt a composite risk score per finding — severity fused with threat intelligence (exploitation evidence, KEV/EPSS) and business context (asset criticality, data sensitivity). We expect >90% of "critical by CVSS" findings to be deprioritized, and a small set of quiet toxic combinations to be elevated.
4. **Continuous, not annual** *(Gartner's CTEM lifecycle)*. We run the exposure-management loop — scope, discover, prioritize, validate, mobilize — as a standing weekly cycle, not an audit-season ritual. The CSF assessment remains the quarterly yardstick; the ROC is the daily engine.
5. **Break the kill chain at choke points.** We do not try to fix everything; we target the cheapest link that breaks the most attack paths (for Alma today: identity — the INC-2024-02 pattern — and internet-facing exposure — the INC-2024-01 pattern).
6. **Three treatments, honestly applied:** mitigate, accept (within written appetite, never "unstructured worry" — *Ron Howard, via Seiersen*), transfer. Our cyber-insurance limits are the board's already-signed, mathematically unambiguous statement of risk appetite — the ROC calibrates against them.
7. **No "dashboard tourism"** *(Sumedh Thakar)*. Every metric must drive a decision. If a report page needs a glossary, it has failed.

## 3. The process — how we establish the ROC

This follows a four-phase ROC implementation pattern (as taught in current ROC practice guidance), scaled to a 300-person company and sequenced by leverage. Our analysis is blunt: our two loudest risks have *inverted* leverage — the asset inventory (R4) is the cheap structural fix that makes every other control honest, while backfilling headcount (R1) is the most expensive fix per unit of risk reduced. So inventory leads, and we close the staffing gap partly by *federating* work into engineering rather than hiring five bodies back.

### Step 0 — Charter and appetite (Month 0–1, ~$0)

- ROC charter approved by the Audit Committee (Priya Raman) as an extension of the existing Series B governance conditions — while that window is open. The charter names the decision rights: the ROC prioritizes, owners remediate, the risk register is the single queue.
- Risk appetite written down once, derived from what already exists: our insurance limits and capital reserves, confirmed by Dana Okafor (CFO). Exit criterion: a one-page appetite statement the board has seen.
- Owner: Gerry Callahan; Leila Haddad drafts.

### Step 1 — Foundation (Months 1–3): see everything once

- **Unified asset inventory**: AWS (EKS, S3, ALB), on-prem Windows domain, endpoints, SaaS — one inventory in ServiceNow, every asset with an owner and a criticality. This retires R4 and is the non-negotiable base: *you cannot secure what you cannot see.* Funded by the existing ASM project ($100K).
- **Critical-five connectors**: vulnerability scanning, cloud posture, SentinelOne (EDR), identity (AD + CyberArk), and pipeline/appsec (Sigstore/Cosign attestations) feed one risk queue.
- Map assets to the revenue they protect (Customer Success + Finance data), so scores can carry dollars.
- **Expect reported risk to spike when the inventory lands** — that is measurement honesty, not deterioration; the board is pre-briefed (Section 5).
- Exit criteria: ≥70% asset coverage with owners; orphan assets <10%; initial composite risk baseline published.
- Owners: Chris Magann (inventory/VM), Nadia Khan (detection connectors), Leila Haddad (register integration).

### Step 2 — Risk operations cadence (Months 3–8): make risk a daily verb

- Stand up the **weekly exposure-management cycle**: intake → composite scoring → validation (is it actually exploitable here?) → mobilization tickets in ServiceNow with SLAs by risk tier.
- **Federate remediation**: engineering squads own their findings queues (Jane Alvarez as first product-side champion); the ROC measures arrival rate, burndown rate, and backlog — the risk-debt ledger.
- Convert the monthly risk-register review into the **Risk Operations Review**: R1–R6 each carry a dollar range, a burndown trend, and a decision ask.
- First **dollars-at-risk estimates** for the top scenarios (extortion via biometric-adjacent data; product auth-bypass; supplier compromise per R6) using calibrated ranges — heat maps retire this quarter (the case Tony Martin-Vegue makes in *Heatmaps to Histograms*).
- Exit criteria: two consecutive months where burndown ≥ arrival on high-tier findings; SLA compliance reported; Wall of Risk (business-unit view) in the executive pack.

### Step 3 — Quantify and automate (Months 9–14)

- **CRQ maturation** (Richard Seiersen's "snipers to generals" progression): move from single-point dollar estimates to loss-exceedance curves for the top five scenarios, plotted against the insurance-derived appetite line; every proposed security investment ships with baseline-vs-projected risk and ROI.
- **Agentic assistance, monitor-first**: automation drafts triage and remediation plans; humans approve. Auto-remediation pilots only on non-critical assets.
- Detection investment continues toward the board KPI: TTD <4 minutes by Jan 2027 — noting honestly that the 81h→9h improvement is partly a visibility artifact until the inventory is complete.
- Exit criteria: LEC-based investment case presented for the FY2027 security budget; ≥1 automated remediation class in production; TTD trend on target.

### Step 4 — Operating maturity (Month 15+)

- Quarterly board reporting fully in the six-section format (Section 5); CSF assessment cycle consumes ROC data automatically (the Q-columns of the assessment become ROC exports, not fieldwork).
- Evaluate managed-ROC augmentation for 24/7 coverage instead of overnight hiring.
- Maturity target: Level 3 "Defined" by end-2027 on a five-level ROC maturity model (Ad Hoc → Repeatable → Defined → Managed → Optimizing), Level 4 "Managed" during 2028.

## 4. People — who runs it

No new department. The ROC is a **hat worn by the existing 15**, redistributed — the natural seed team being vulnerability management merged with asset visibility (a pattern Jonathan Trull advocates):

| ROC role | Alma person | Existing role |
|---|---|---|
| ROC Lead | Gerry Callahan (interim) → promoted internal lead in 2027 | CISO |
| Risk Operations Analyst(s) | Chris Magann + Tigan Wang | Vulnerability Management |
| Integration / data-pipeline engineer | 1 hire (repurposed from the R1 backfill plan) | new |
| Business-context analyst | Leila Haddad | Security GRC Lead |
| Detection & Response (right of boom, fusion partner) | Nadia Khan + team | D&R |

Career path made explicit to retain the rebuilt team: VM analyst → ROC analyst → senior → ROC lead — the road to CISO runs through risk operations, not only through incident response.

## 5. Reporting — how the board sees it evolve

Three layers, three cadences:

- **Board (quarterly, pre-socialized, brief):** How much risk in dollars; what is the plan (mitigate/accept/transfer allocation); what is the progress. Six one-page sections; every page readable without a glossary. Loss curves stay OUT of the boardroom — they live at the committee layer. *"Be brief, be brilliant, be gone"* (Richard Seiersen, on his 90-second GE board update).
- **Audit Committee (monthly):** arrival/burndown/backlog, SLA compliance, Average Exposure Window (our replacement for mean-only TTR), composite risk-score trend annotated with events, R1–R6 burndown.
- **Business/engineering (weekly):** the operational queue — crown-jewel exposure detail, per-squad SLAs.

**Metrics ladder (baselines → targets):** TTD 9h (from 81h Oct-2024 baseline) → <4 min Jan 2027 · TTR-CJC → <16h Aug 2027 · TTR-C → <3 days Aug 2027 · public trust → 90%+ Jan 2027 · orphan assets → <10% end of Step 1 · burndown ≥ arrival sustained from Step 2 · risk expressed in dollars for 100% of board-visible items from Step 3.

## 6. How the roadmap itself evolves

The ROC is built to outlive its first tooling choices: the industry arc runs GRC → IRM → CTEM → ROC, and the constant is the financial-loss lens, which is evergreen — it will absorb AI-era risks (model supply chain, agentic access) without redesign, because "what loss, what probability, what should we spend" applies to any technology. Concretely: each quarter the Risk Operations Review re-scores this roadmap's exit criteria; each year the appetite statement is re-derived from the renewed insurance program; and the 2028 horizon (further automation of assurance evidence) is a placeholder we re-evaluate, not a commitment.

**The one-sentence version:** first we see everything (inventory), then we operate risk weekly instead of annually (cadence), then we price it (CRQ), then we automate it — and the board watches the same six pages get truer every quarter.
