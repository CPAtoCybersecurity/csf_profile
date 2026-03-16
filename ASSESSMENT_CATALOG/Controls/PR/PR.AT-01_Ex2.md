# PR.AT-01_Ex2: Social Engineering Recognition and Reporting

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-02 (Literacy Training and Awareness), AT-02(1) (Practical Exercises)

## Implementation Example

> Train personnel to recognize social engineering attacks and provide mechanisms for reporting suspected incidents.

## Alma Security Implementation

Alma Security operates a mature social engineering awareness program anchored by quarterly phishing simulations and dedicated Workday training modules on social engineering tactics. The phishing simulation program sends realistic campaigns to all 300 employees on a quarterly cadence, using templates that mirror actual threats observed in the wild, including credential harvesting, business email compromise, and pretexting scenarios targeting Alma's SaaS customer base.

When an employee clicks a simulated phishing link, they are immediately redirected to an educational landing page explaining the indicators they missed and reinforcing correct behavior. Employees who click on two or more simulated phishing emails within a rolling 12-month period are automatically enrolled in supplemental Workday training focused on social engineering recognition. The D&R team tracks click rates across departments and reports trends to leadership monthly.

Reporting mechanisms are clearly communicated during onboarding and reinforced in every quarterly training cycle. Employees are instructed to forward suspicious emails to the dedicated phishing report inbox (phishing@almasecurity.com) and to post in the #security-alerts Slack channel for time-sensitive concerns. The D&R team, led by Nadia Khan, triages reported emails and provides feedback to reporters, reinforcing the reporting behavior. Alma's average phishing simulation click rate has trended down from 18% to approximately 7% over the past four quarters.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Phishing simulation campaign results (last 4 quarters) | Phishing platform dashboard | 2026-03-12 |
| Click rate trend report | Security team quarterly report | 2026-03-12 |
| Supplemental training enrollment records for repeat clickers | Workday Learning | 2026-03-10 |
| Phishing report inbox triage logs | phishing@almasecurity.com / Exchange | 2026-03-08 |
| Slack #security-alerts reporting activity | Slack audit logs | 2026-03-08 |
| Social engineering training module content | Workday Learning | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 6 | 7 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Phishing simulations do not include SMS/voice (vishing) vectors | Medium — employees may be less prepared for non-email social engineering | Add vishing simulation capability in next platform contract renewal | Security Team | Q3 2026 |
| No formal reward or recognition program for employees who report phishing | Low — reporting rates are good but could be reinforced with positive incentives | Design quarterly "Phish Spotter" recognition program | Security Team + HR | Q2 2026 |
