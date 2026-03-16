# PR.AT-01_Ex1: Provide Basic Cybersecurity Awareness Training

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-01 (Policy and Procedures), AT-02 (Literacy Training and Awareness)

## Implementation Example

> Provide basic cybersecurity awareness training to all employees, including recognizing common threats, safe computing practices, and organizational security policies.

## Alma Security Implementation

Alma delivers mandatory cybersecurity awareness training to all 300 employees through Workday on a quarterly cadence, covering password hygiene, device security, data classification, acceptable use, and common attack vectors. New hire onboarding requires completion of the security training module within 14 days, with ServiceNow access provisioning gated on Workday training confirmation. Training content is reviewed semi-annually by the security team, and completion dashboards are available to managers via Workday.

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
