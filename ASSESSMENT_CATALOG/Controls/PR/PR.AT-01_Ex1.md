# PR.AT-01_Ex1: Provide Basic Cybersecurity Awareness Training

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-01 (Policy and Procedures), AT-02 (Literacy Training and Awareness)

## Implementation Example

> Provide basic cybersecurity awareness training to all employees, including recognizing common threats, safe computing practices, and organizational security policies.

## Alma Security Implementation

Alma Security delivers mandatory cybersecurity awareness training to all 300 employees through Workday, the organization's HR and learning management platform. The training program covers foundational topics including password hygiene, device security, data classification and handling, acceptable use policies, and recognizing common attack vectors. All training modules are assigned automatically upon hire and on a quarterly recurring schedule.

New hire onboarding at Alma includes a mandatory security training module that must be completed within the first 14 days of employment. System access provisioning through ServiceNow is gated on training completion confirmation from Workday, ensuring no employee receives credentials or access to production systems before completing baseline awareness training. The security team coordinates with HR to ensure the Workday enrollment workflow is triggered by the onboarding checklist.

The training content is reviewed and updated semi-annually by the security team to reflect the current threat landscape, with the most recent update incorporating lessons from real phishing attempts observed in Alma's environment. Training completion dashboards are available to managers via Workday, and the security team sends Slack reminders to the #security-alerts channel when quarterly training windows open.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Security awareness training modules | Workday Learning | 2026-03-10 |
| Training completion rate dashboard | Workday Reporting | 2026-03-10 |
| New hire onboarding checklist with security training gate | HR/Workday workflow | 2026-02-28 |
| ServiceNow access provisioning requires Workday training confirmation | ServiceNow workflow config | 2026-01-15 |
| Quarterly training reminder Slack messages | #security-alerts channel | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 5 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Training content not yet localized for international contractors (12 contractors in EMEA) | Low — small population, English proficiency is high, but localization improves comprehension | Evaluate Workday localization options for top 2 languages | HR Lead | Q3 2026 |
| No formal measurement of knowledge retention beyond completion tracking | Medium — completion does not guarantee comprehension | Implement post-training quiz with 80% pass threshold in Workday | Security Team | Q2 2026 |
