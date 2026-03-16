# GV.RM — Risk Management Strategy: Assessment Artifacts
## Alma Security Case Study — Issue #30

**CSF 2.0 Category:** GV.RM (GOVERN: Risk Management Strategy)  
**Subcategories covered:** GV.RM-01, GV.RM-02, GV.RM-03  
**Assessment period:** Q1–Q2 2026

The following artifacts should be gathered and linked as evidence during a GV.RM assessment of
Alma Security. Each artifact maps to one or more test procedures in `GV.RM_test_procedures.md`.

---

## Artifact 1 — Risk Register (Current State, Q1 2026)

**What it is:** Alma Security's formal risk register documenting five major cybersecurity risks,
their owners, ratings, and treatment status.

**Format:** Spreadsheet (Excel/Google Sheets) or risk management platform export (e.g., from
a Jira risk tracking project or GRC tool).

**Minimum fields required:**
- Risk ID, Risk Title, Risk Description
- Likelihood (Low / Medium / High)
- Impact (Low / Medium / High)
- Inherent Risk Rating (combined likelihood × impact)
- Risk Owner (name and title)
- Treatment Option (Accept / Mitigate / Transfer / Avoid)
- Treatment Description
- Target Resolution Date
- Current Status (Open / In Progress / Closed)
- Residual Risk Rating (after treatment)
- Last Review Date

**Expected content for Alma (Q1 2026 snapshot):**

| Risk ID | Title | Likelihood | Impact | Owner | Treatment | Target Date | Status |
|---|---|---|---|---|---|---|---|
| R-01 | Infrastructure Security Understaffing | High | High | CISO | Mitigate (hiring + MDR) | Q2 2026 | In Progress |
| R-02 | Incomplete Asset Inventory | High | Medium | VP Engineering | Mitigate (AWS Config + manual reconciliation) | Q1 2026 | In Progress |
| R-03 | Slow Incident Detection (TTD) | Medium | High | SOC Manager | Mitigate (GuardDuty + Splunk) | Q1 2026 | Largely Resolved (TTD 7hrs) |
| R-04 | Low Customer Trust | Medium | High | CISO / CMO | Mitigate (SOC 2 roadmap, trust center) | Q3 2026 | In Progress |
| R-05 | Third-Party Vendor Risk | Medium | Medium | VP Procurement | Mitigate (vendor questionnaire program) | Q2 2026 | In Progress |

**Maps to:** GV.RM-01 (Test Procedures 1.1, 1.4), GV.RM-02 (Test Procedure 2.2)

---

## Artifact 2 — Risk Appetite and Tolerance Statement

**What it is:** A one-to-two page document, approved by CISO and CEO, that defines what risks
Alma is willing to accept and the thresholds that require mandatory treatment.

**Key components to include:**

**Risk Appetite (what Alma actively accepts):**
> Alma Security accepts moderate operational risk in pursuit of its growth objectives, provided
> that cybersecurity risks to customer data and platform availability are actively managed.
> We accept low-to-medium risks in areas where compensating controls exist and where business
> velocity would be disproportionately impacted by full remediation.

**Risk Tolerance thresholds (mandatory action boundaries):**
> - Any risk rated High Likelihood AND High Impact requires a documented treatment plan within
>   30 days of identification. Treatment must be approved by the CISO.
> - Any risk involving potential exposure of customer PII or platform credentials is classified
>   as intolerable and must be escalated to the CEO within 24 hours of identification.
> - Risks rated Medium/High or High/Medium require treatment plans within 60 days.
> - Risks rated Low/Medium or below may be accepted with annual review.

**Approval block:**
> CISO: [Name] — Approved [Date]  
> CEO: [Name] — Reviewed [Date]  
> Board Audit Committee: Pending ratification — Target Q2 2026

**Maps to:** GV.RM-03 (Test Procedures 3.1, 3.2, 3.3)

---

## Artifact 3 — Risk Assessment Summary (Q1 2026)

**What it is:** A two-to-three page executive summary of Alma's current risk posture, suitable
for Board presentation. Produced by the CISO quarterly.

**Required sections:**
1. Executive Summary — current overall risk rating (e.g., Moderate), trend vs. prior quarter
2. Top Risks Dashboard — visual heat map of all five risks by likelihood/impact
3. Treatment Progress — status of each active treatment plan with milestone updates
4. Metrics — TTD trend (81 hrs → 7 hrs), asset inventory coverage %, vendor assessment %,
   open security role headcount vs. target
5. Forward Look — risks expected to change rating in Q2 2026
6. Asks of the Board — any decisions or approvals needed (e.g., ratification of risk appetite statement)

**Sample heat map layout:**

```
                    IMPACT
                 Low   Med   High
              ┌─────┬─────┬──────┐
         High │     │ R-02│ R-01 │
  LIKELIHOOD  ├─────┼─────┼──────┤
       Medium │     │ R-05│R-03* │
              ├─────┼─────┼──────┤
          Low │     │     │ R-04 │
              └─────┴─────┴──────┘
 *R-03 trending toward Medium/Medium after TTD improvements
```

**Maps to:** GV.RM-01 (Test Procedure 1.4), GV.RM-02 (Test Procedure 2.2)

---

## Artifact 4 — CISO Interview Notes (GV.RM Assessment)

**What it is:** Structured notes from a 30-60 minute interview with Alma's CISO conducted as
part of the GV.RM assessment. The assessor takes notes; the CISO reviews for accuracy before
the notes are finalized.

**Interview guide questions:**

*Risk Management Objectives (GV.RM-01):*
- How were Alma's cybersecurity risk management objectives established?
- How are they connected to the company's growth targets?
- Which business stakeholders were involved in defining them?

*Risk Strategy (GV.RM-02):*
- Describe how a new risk is identified, assessed, and entered into the register.
- How do you decide what treatment approach to take?
- How often is the strategy reviewed, and what triggers an off-cycle review?

*Risk Appetite and Tolerance (GV.RM-03):*
- How does Alma define what is an acceptable level of risk?
- Has the risk appetite statement been communicated to non-security executives?
- Can you give an example where a risk exceeded tolerance and triggered an escalation?

**Sample completed interview excerpt (for illustrative purposes):**

> *Q: How were Alma's cybersecurity risk management objectives established?*
>
> A: "When I joined 18 months ago, there was no formal risk register — we were essentially
> doing ad-hoc risk management. I spent the first 90 days interviewing department heads, reviewing
> our incident history, and looking at what we'd need to demonstrate for SOC 2. That gave us the
> five major risks we're working from now. The CEO and CFO reviewed the list and signed off on the
> prioritization. R-01 (understaffing) was immediately flagged by the CEO as a Board-level concern
> because it was coming up in enterprise sales conversations."

**Maps to:** GV.RM-01 (Test Procedures 1.2, 1.3), GV.RM-02 (Test Procedure 2.3), GV.RM-03 (Test Procedure 3.3)

---

## Artifact 5 — Risk Treatment Plan: R-01 (Infrastructure Understaffing)

**What it is:** A single-risk treatment plan document for R-01, the highest-rated risk in
Alma's register. This demonstrates the depth of treatment planning expected for High/High risks.

**Treatment plan template completed for R-01:**

| Field | Detail |
|---|---|
| Risk ID | R-01 |
| Risk Title | Infrastructure Security Team Understaffing (~50% of target headcount) |
| Risk Owner | CISO |
| Date Identified | Oct 2024 |
| Likelihood | High |
| Impact | High |
| Inherent Risk Rating | High |
| Treatment Option | Mitigate |
| Treatment Description | Two-track approach: (1) active hiring for 3 open security engineer roles with Q2 2026 target close dates; (2) compensating control via CrowdStrike MDR contract covering endpoint detection and 24/7 monitoring while headcount gap persists |
| Compensating Controls | CrowdStrike Falcon Complete MDR; Splunk on-call alert routing to MDR team outside business hours |
| Milestones | Q1 2026: MDR contract signed and operational (DONE); Q2 2026: 2 of 3 roles filled; Q3 2026: Full team capacity reached |
| KPIs | Open security role count (target: 0 by Q3 2026); MDR coverage hours per week (target: 168/168) |
| Residual Risk (post-treatment) | Medium |
| Escalation Trigger | If hiring falls further behind schedule or if MDR service level is breached |
| Last Reviewed | Feb 2026 |

**Maps to:** GV.RM-02 (Test Procedures 2.1, 2.2), GV.RM-03 (Test Procedure 3.2)

---

## Artifact 6 — Board/Risk Committee Reporting Example (Q4 2025)

**What it is:** A sample one-page board-level cybersecurity risk summary as would be presented
to Alma's Audit and Risk Committee. This artifact demonstrates that GV.RM-01's requirement for
stakeholder agreement on risk objectives extends to Board-level governance.

**Sample report structure:**

```
ALMA SECURITY — BOARD CYBERSECURITY RISK UPDATE
Q4 2025 | Prepared by: CISO | For: Audit and Risk Committee

OVERALL RISK POSTURE: MODERATE (↓ from Elevated in Q3 2025)

HIGHLIGHTS THIS QUARTER:
  ✓ TTD reduced from 81 hours to 12 hours (Splunk + GuardDuty implementation)
  ✓ CrowdStrike MDR contract signed — 24/7 coverage operational Dec 2025
  ✓ Vendor questionnaire program launched — 40% of Tier 1 vendors assessed
  ⚠ R-01 (Understaffing): 3 roles still open; compensating controls in place
  ⚠ R-02 (Asset Inventory): 72% cloud asset coverage; Q1 2026 target is 95%

BOARD ACTIONS REQUESTED:
  1. Review and ratify Risk Appetite Statement (attached) — target Q1 2026
  2. Approve headcount for 3 security engineer roles (budget request attached)

NEXT REVIEW: Q1 2026 (March Board Meeting)
```

**Maps to:** GV.RM-01 (Test Procedure 1.4), GV.RM-03 (Test Procedure 3.3)

---

## References

- NIST Cybersecurity Framework 2.0: GV.RM — https://www.nist.gov/cyberframework
- NIST SP 800-39: Managing Information Security Risk
- NIST SP 800-30 Rev 1: Guide for Conducting Risk Assessments
- Alma Security Case Study Materials: https://github.com/CPAtoCybersecurity/csf_profile/tree/feature/api-integration/EXAMPLE_BUSINESS_CASE_STUDY_FOR_ASSESSMENT
