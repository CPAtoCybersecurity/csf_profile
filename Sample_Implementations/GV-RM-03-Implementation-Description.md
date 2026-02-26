# GV.RM — Risk Management Strategy: Implementation Description
## Alma Security Case Study — Issue #30

**CSF 2.0 Category:** GV.RM (GOVERN: Risk Management Strategy)  
**Subcategories covered:** GV.RM-01, GV.RM-02, GV.RM-03  
**Assessment period:** Q1–Q2 2026

---

## How Alma Security Implements GV.RM

Alma Security operates as a ~120-person Series B cybersecurity SaaS company. Its risk management
strategy is driven by a dual obligation: protecting its own platform (which customers trust to
protect *their* environments) and maintaining the operational security posture required to close
enterprise accounts and progress toward SOC 2 Type II certification.

Risk management ownership sits with the CISO, who reports quarterly to the Board's Audit and Risk
Committee. The security team maintains a formal risk register with five documented major risks,
each with an assigned owner, treatment plan, and target remediation timeline. The register is
reviewed in monthly CISO staff meetings and updated formally each quarter.

---

## Current-State Summary by Subcategory

| Subcategory | Description | Alma's Current State |
|---|---|---|
| GV.RM-01 | Risk management objectives established and agreed to by stakeholders | Risk register exists, CISO owns it, Board reviews quarterly. Objectives tied to SOC 2 and sales pipeline. |
| GV.RM-02 | Risk strategy is established, agreed to, and managed | Written risk strategy document exists. Reviewed annually; last review Oct 2025. Partially aligned to NIST CSF 2.0. |
| GV.RM-03 | Risk appetite and tolerance defined and communicated | Risk appetite statement drafted by CISO, reviewed by CFO and CEO. Not yet formally ratified by Board. |

---

## The Five Documented Risks (Q1 2026)

| Risk ID | Risk Description | Likelihood | Impact | Current Treatment |
|---|---|---|---|---|
| R-01 | Infrastructure security team understaffed (~50% of target headcount) | High | High | Active hiring; interim compensating controls via CrowdStrike MDR |
| R-02 | Incomplete asset inventory — cloud assets not fully catalogued | High | Medium | AWS Config enabled; manual reconciliation underway |
| R-03 | Slow incident detection (TTD averaging 3+ days before Oct 2024) | Medium | High | GuardDuty + Splunk SIEM implemented; TTD now ~7 hours as of Mar 2026 |
| R-04 | Low public/customer trust due to prior security incident publicity | Medium | High | Customer communication program, SOC 2 roadmap published externally |
| R-05 | Third-party vendor risk — key SaaS dependencies without security assessments | Medium | Medium | Vendor questionnaire program initiated Q4 2025; 60% of Tier 1 vendors assessed |

---

## Connection to Business Goals

The risk strategy explicitly acknowledges that Alma's target of 10,000 customers by January 2027
requires enterprise-grade security assurance. R-01 (understaffing) and R-04 (trust) are rated as
the highest-priority risks relative to revenue impact because large enterprise prospects cite both
as deal blockers. GV.RM-01 therefore links each risk treatment milestone to a sales-enablement KPI
tracked by the CRO alongside the CISO.

---

## Scoring Assessment (Q1 2026)

Using the 0–10 scoring scale from *Mastering Cyber Resilience* (AKYLADE):

| Subcategory | Score | Rationale |
|---|---|---|
| GV.RM-01 | 5.5 — Minimally Acceptable | Risk register exists with five documented risks, CISO owns it, and Board reviews quarterly. Objectives tied to business goals. Gap: stakeholder awareness outside executive team is limited; engineering staff generally unaware of the risk register. |
| GV.RM-02 | 5.0 — Minimally Acceptable | Risk strategy document exists and was reviewed Oct 2025. Treatment evidence is present for all five risks. Gap: the risk identification process is largely CISO-driven with limited bottom-up contribution; no formal risk identification cadence for non-security teams. |
| GV.RM-03 | 4.5 — Some Security | Risk appetite statement is drafted and reviewed by CISO, CEO, and CFO. Gap: not yet Board-ratified; no documented examples of the tolerance thresholds actively driving a treatment decision. Trending toward Minimally Acceptable once Board ratification is complete in Q2 2026. |

**Target state (Q3 2026, post-SOC 2 Type II audit readiness):**

| Subcategory | Target Score | What Gets Us There |
|---|---|---|
| GV.RM-01 | 6.5 — Optimized | Risk objectives formally approved by Board, embedded in annual company planning cycle, and understood by department heads across the company |
| GV.RM-02 | 6.5 — Optimized | Risk identification is a shared process with defined touchpoints for engineering, legal, and product teams; strategy reviewed semi-annually and after material incidents |
| GV.RM-03 | 6.5 — Optimized | Board-ratified risk appetite statement; at least two documented examples of tolerance thresholds driving escalation or treatment decisions in the prior 12 months |

---

## References

- NIST Cybersecurity Framework 2.0: GV.RM — https://www.nist.gov/cyberframework
- NIST SP 800-39: Managing Information Security Risk
- NIST SP 800-30 Rev 1: Guide for Conducting Risk Assessments
- Alma Security Case Study Materials: https://github.com/CPAtoCybersecurity/csf_profile/tree/feature/api-integration/EXAMPLE_BUSINESS_CASE_STUDY_FOR_ASSESSMENT
