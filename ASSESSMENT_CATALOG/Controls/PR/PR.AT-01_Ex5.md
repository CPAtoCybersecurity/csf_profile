# PR.AT-01_Ex5: Require Annual Cybersecurity Awareness Refreshers

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-02 (Literacy Training and Awareness), AT-06 (Training Feedback)

## Implementation Example

> Require annual refresher training for all employees to maintain and update their cybersecurity awareness knowledge.

## Alma Security Implementation

Alma Security mandates annual cybersecurity awareness refresher training for all employees as a baseline policy requirement, with the actual training cadence exceeding this minimum at quarterly intervals. The Information Security Policy specifies that every employee must complete at least one comprehensive security awareness refresher per calendar year, with Workday configured to automatically assign the annual refresher module and track compliance. Employees who do not complete the annual refresher within the designated window are flagged in Workday, and their managers receive automated escalation notifications.

The quarterly training cadence effectively means Alma employees complete four awareness touchpoints per year, each covering different focus areas while reinforcing core principles. The Q1 module typically covers the annual refresher content, including updated policy acknowledgments, current threat landscape briefings, and review of any security incidents or near-misses from the prior year. Q2 through Q4 modules are shorter and more targeted, focusing on seasonal or emerging threats. This quarterly rhythm exceeds the annual refresher requirement and keeps security awareness top-of-mind throughout the year.

The security team reviews annual completion rates at year-end and reports to the CISO. For 2025, the annual refresher completion rate was 94% across all employees, with the remaining 6% attributed to employees on extended leave who were enrolled upon return. The team is targeting 97% completion for 2026 by implementing earlier escalation triggers and working with HR to incorporate training compliance into performance review considerations.

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
