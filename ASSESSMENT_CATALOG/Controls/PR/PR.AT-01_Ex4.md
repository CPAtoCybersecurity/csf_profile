# PR.AT-01_Ex4: Periodically Assess and Test User Understanding

**Subcategory:** PR.AT-01 — Personnel are provided awareness and training so that they possess the knowledge and skills to perform general tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-02 (Literacy Training and Awareness), AT-04 (Training Records)

## Implementation Example

> Periodically assess or test users on their understanding of cybersecurity topics covered in awareness training.

## Alma Security Implementation

Alma Security currently uses phishing simulations as the primary mechanism for periodically assessing employee understanding of cybersecurity awareness topics. Quarterly phishing campaigns serve as practical tests of whether employees can identify and correctly respond to social engineering attempts. Click rates, report rates, and time-to-report metrics are tracked per department and trended over time by the security team.

Beyond phishing simulations, the quarterly Workday training modules include completion-tracked assessments. However, these assessments are currently structured as acknowledgment-based checkpoints rather than scored knowledge tests. Employees complete the module and confirm understanding, but there is no pass/fail threshold or scored quiz component that would provide a quantitative measure of comprehension. The security team has identified this as a maturity gap and has planned the implementation of scored assessments for Q2 2026.

The D&R team informally assesses understanding during incident response activities by evaluating whether employees follow reporting procedures correctly when real or simulated incidents occur. Nadia Khan's team tracks whether employees use the correct reporting channels (phishing@almasecurity.com or #security-alerts Slack) versus ad-hoc methods. This behavioral data supplements the simulation results but is not yet formalized into a structured assessment framework.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Phishing simulation results with per-department click rates | Phishing platform dashboard | 2026-03-12 |
| Workday training completion records with acknowledgment data | Workday Reporting | 2026-03-10 |
| Incident reporting channel usage analysis | D&R team internal report | 2026-03-05 |
| Phishing report-rate metrics (employees reporting vs. clicking) | Phishing platform dashboard | 2026-03-12 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Gap |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No scored knowledge assessments — current Workday modules use acknowledgment-only format | High — cannot quantitatively measure whether employees actually understand the material | Implement post-module quizzes in Workday with 80% pass threshold and remedial re-enrollment for failures | Security Team | Q2 2026 |
| Assessment results not aggregated into a single dashboard | Medium — difficult to get holistic view of workforce security knowledge | Build unified assessment dashboard combining phishing sim results, Workday completions, and quiz scores | Security Team | Q3 2026 |
| No baseline assessment administered at onboarding to measure starting knowledge level | Low — limits ability to demonstrate training effectiveness over time | Add pre-training baseline quiz to new hire onboarding workflow in Workday | HR + Security Team | Q3 2026 |
