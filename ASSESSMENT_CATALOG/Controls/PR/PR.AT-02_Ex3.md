# PR.AT-02_Ex3: Periodically Assess Specialized Role Understanding

**Subcategory:** PR.AT-02 — Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-03 (Role-Based Training), AT-04 (Training Records)

## Implementation Example

> Periodically assess or test individuals in specialized roles on their understanding and application of role-specific cybersecurity knowledge, skills, and procedures.

## Alma Security Implementation

Alma Security's approach to assessing specialized role competency is currently informal and operationally embedded rather than structured through dedicated testing mechanisms. The primary means of assessing D&R team capabilities is through incident response performance. Nadia Khan evaluates her team's effectiveness during real incidents and tabletop exercises, tracking metrics like mean time to detect (MTTD), mean time to respond (MTTR), and quality of incident documentation. These operational performance indicators serve as proxy assessments of whether the team possesses the required skills, but they are not structured as formal competency evaluations.

For the vulnerability management team, Chris Magann and Tigan Wang are assessed indirectly through the quality and timeliness of their vulnerability scan analysis, patch prioritization accuracy, and remediation tracking. Chris Magann's GIAC certification provides external validation of specialized knowledge. However, there is no formal periodic testing mechanism such as role-specific quizzes, practical examinations, or scenario-based evaluations administered on a defined schedule.

The security team conducted one tabletop exercise in Q4 2025 that tested D&R analysts' incident handling procedures and communication protocols. The exercise revealed gaps in escalation procedures for cloud-specific incidents (AWS) that were subsequently addressed through targeted training. This type of exercise-based assessment is valuable but occurs irregularly. The CISO has identified the need for a structured semi-annual assessment program for all specialized roles as part of the Q2-Q3 2026 training maturity improvement initiative.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| D&R team incident response performance metrics (MTTD/MTTR) | Security team dashboard | 2026-03-12 |
| Q4 2025 tabletop exercise after-action report | Security team documentation | 2025-12-15 |
| VM team vulnerability remediation tracking metrics | VM team reporting | 2026-03-01 |
| Chris Magann GIAC certification (external validation) | GIAC portal | 2026-01-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Gap |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal periodic competency assessments for specialized roles | High — competency is inferred from operational performance rather than directly measured | Design semi-annual role-specific assessments covering tool proficiency, procedure knowledge, and scenario-based problem solving | CISO + Team Leads | Q3 2026 |
| Tabletop exercises are irregular (one in the last 6 months) | Medium — exercise-based assessment is the most realistic evaluation method but is not on a consistent schedule | Establish quarterly tabletop exercise calendar with rotating scenarios (cloud incident, ransomware, insider threat, supply chain) | Nadia Khan + CISO | Q2 2026 |
| No competency baseline established — cannot measure improvement over time | Medium — without baselines, training effectiveness cannot be demonstrated | Administer baseline competency assessment to all specialized role personnel before next training cycle | Security Team | Q2 2026 |
