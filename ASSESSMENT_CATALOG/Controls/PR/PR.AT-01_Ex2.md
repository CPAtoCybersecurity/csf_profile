# PR.AT-01_Ex2: Social Engineering Recognition and Reporting

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-02 (Literacy Training and Awareness), AT-02(1) (Practical Exercises)

## Implementation Example

> Train personnel to recognize social engineering attacks and provide mechanisms for reporting suspected incidents.

## Alma Security Implementation

Alma runs quarterly phishing simulations against all 300 employees covering credential harvesting, BEC, and pretexting scenarios, with repeat clickers auto-enrolled in supplemental Workday training. Employees report suspicious emails to phishing@almasecurity.com and the #security-alerts Slack channel, with the D&R team triaging all reports. The simulation click rate has decreased from 18% to approximately 7% over the past four quarters.

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
