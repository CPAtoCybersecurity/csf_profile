# PR.AT-01_Ex3: Communicate Consequences of Policy Violations

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-01 (Policy and Procedures), AT-02 (Literacy Training and Awareness)

## Implementation Example

> Explain the consequences of not following cybersecurity policies, including potential disciplinary actions and impact to the organization.

## Alma Security Implementation

Alma Security's Acceptable Use Policy and Information Security Policy both contain explicit sections detailing consequences for cybersecurity policy violations, ranging from mandatory retraining for minor infractions to disciplinary action up to and including termination for willful or repeated violations. These policies are published on the company intranet and are referenced during new hire onboarding security training via Workday.

During quarterly security awareness training, the training module includes a dedicated section on policy compliance expectations and consequences. The content uses anonymized real-world examples relevant to Alma's environment, such as scenarios involving unauthorized sharing of customer data, disabling endpoint protection (SentinelOne), or circumventing Windows Authenticator SSO. Each scenario walks through the policy violation, its potential business impact to Alma's customer trust and regulatory standing, and the resulting disciplinary process. Employees are required to acknowledge the Acceptable Use Policy annually via Workday.

HR and the security team maintain a documented escalation path for violations. First-time unintentional violations trigger mandatory supplemental training and a documented conversation with the employee's manager. Repeat violations or intentional policy circumvention are escalated through HR's formal disciplinary process with security team input. The CISO reviews all escalated cases quarterly to identify systemic gaps that may require policy updates or additional training.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Acceptable Use Policy with consequences section | Company intranet / Policy repository | 2026-02-20 |
| Information Security Policy disciplinary procedures | Company intranet / Policy repository | 2026-02-20 |
| Quarterly training module on policy compliance | Workday Learning | 2026-03-10 |
| Annual AUP acknowledgment records | Workday | 2026-01-31 |
| Policy violation escalation procedure document | HR / Security shared documentation | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Consequences are documented but not consistently communicated to contractors and third-party personnel | Medium — contractors represent a growing portion of the workforce and may not be aware of Alma-specific consequences | Extend AUP acknowledgment requirement to all contractors via vendor onboarding process | Security Team + Legal | Q2 2026 |
| No metrics tracked on policy violation frequency or trends | Low — makes it difficult to measure whether awareness efforts reduce violations | Implement quarterly policy violation tracking report | CISO | Q3 2026 |
