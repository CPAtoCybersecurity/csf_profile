# PR.AT-01_Ex5: Require Annual Cybersecurity Awareness Refreshers

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-02 (Literacy Training and Awareness), AT-06 (Training Feedback)

## Implementation Example

> Require annual refresher training for all employees to maintain and update their cybersecurity awareness knowledge.

## Alma Security Implementation

Alma mandates annual cybersecurity awareness refresher training per the Information Security Policy, with Workday auto-assigning modules and escalating non-completion to managers. The actual cadence exceeds this at quarterly intervals -- Q1 covers the comprehensive annual refresher while Q2-Q4 modules target seasonal and emerging threats. The 2025 annual completion rate was 94%, with a 97% target for 2026.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Information Security Policy annual training requirement | Company intranet / Policy repository | 2026-02-20 |
| Workday annual refresher module configuration | Workday Learning admin | 2026-01-15 |
| 2025 annual refresher completion rate report (94%) | Workday Reporting | 2026-01-31 |
| Quarterly training schedule and module assignments | Security team planning doc | 2026-03-01 |
| Manager escalation notification configuration in Workday | Workday workflow admin | 2026-01-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 6% non-completion rate attributed to extended leave — no catch-up mechanism beyond return-to-work enrollment | Low — small population, but creates a compliance gap during leave period | Implement "return from leave" auto-enrollment trigger in Workday with 7-day completion window | HR + Security Team | Q2 2026 |
| No mechanism to update refresher content mid-year in response to emerging threats | Medium — annual content can become stale if a significant new threat emerges between planned updates | Establish "rapid update" process allowing the security team to push supplemental micro-trainings outside the quarterly schedule | Security Team | Q2 2026 |
