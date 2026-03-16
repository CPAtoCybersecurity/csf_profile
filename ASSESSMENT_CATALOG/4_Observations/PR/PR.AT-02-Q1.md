# PR.AT-02: Specialized Role-Based Training -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed specialized training records, vendor certifications, tabletop exercise after-action reports, team rosters |
| Interview | Yes | Interviewed Nadia Khan (D&R lead) and Chris Magann (VM) regarding team training practices and gaps |
| Test | Yes | Verified training completion records against team rosters, reviewed incident response performance metrics |

---

## Findings

### Strengths

- **D&R team receives structured vendor training.** Nadia Khan's D&R team completes SentinelOne EDR training through the vendor platform, and the team participates in incident response tabletop exercises. This team has the most mature specialized training practice at Alma.

- **VM team pursues professional development.** Chris Magann holds GIAC certifications that Alma partially funds, and both Chris and Tigan Wang attend vendor conferences and webinars. The team demonstrates individual initiative in maintaining specialized knowledge.

- **Tabletop exercises provide practical assessment.** The Q4 2025 tabletop exercise tested D&R analysts on incident handling and escalation procedures. The exercise identified actionable gaps in cloud-specific (AWS) incident response that were subsequently addressed through targeted training.

- **Operational performance serves as informal assessment.** D&R incident response metrics (MTTD, MTTR) and VM remediation tracking provide indirect evidence of whether specialized personnel possess the required skills to execute their responsibilities effectively.

### Gaps

- **No formal role classification matrix.** Specialized training designations are based on institutional knowledge rather than a documented, policy-backed role classification matrix. As Alma scales, new roles may not be evaluated for specialized training requirements.

- **Training tracked outside Workday.** Specialized training completion is tracked in team-level spreadsheets and vendor portals rather than the centralized Workday platform. This creates fragmented audit trails and limits management visibility into compliance.

- **No formal competency assessments.** There are no structured, periodic tests or evaluations to measure whether specialized personnel have retained and can apply role-specific knowledge. Competency is inferred from operational performance rather than directly assessed.

- **No annual specialized refresher policy.** While general awareness refreshers are mandated quarterly, there is no distinct policy requirement for specialized role refreshers covering role-specific content. Refresher activity depends on vendor release cycles and individual initiative.

- **Developer security training is optional.** Developer and DevSecOps roles are not formally designated as specialized training roles despite having production access and writing security-sensitive code. Security training for these roles is limited to optional lunch-and-learn sessions.

- **VM team lacks formal curriculum.** While the VM team members are skilled, there is no documented training plan that maps to their specific responsibilities with Alma's AWS and Windows domain controller infrastructure.

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |
| Trend | Stable (new assessment baseline) |

---

## Evidence Reviewed

- D&R team training records (SentinelOne vendor portal, internal spreadsheet)
- Q4 2025 tabletop exercise after-action report
- VM team vendor conference attendance and expense records
- Chris Magann GIAC certification documentation
- Palo Alto firewall training records for network administrators
- D&R team incident response metrics (MTTD/MTTR dashboard)
- VM team vulnerability remediation tracking reports
- Developer security lunch-and-learn attendance records
- Security team org chart and informal specialized role designation list

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Create and publish a formal role classification matrix defining criteria for specialized training designation, reviewed annually | High | CISO + HR |
| 2 | Migrate all specialized training tracking into Workday Learning with role-based curricula and centralized compliance reporting | High | Security Team + HR |
| 3 | Develop documented training plans for each specialized role (D&R, VM, DevSecOps, network/system admin) mapped to tools and responsibilities | High | CISO + Team Leads |
| 4 | Establish mandatory developer security training covering OWASP Top 10, secure coding, and dependency scanning | High | Security Team + Engineering Lead |
| 5 | Implement semi-annual role-specific competency assessments combining knowledge tests and scenario-based exercises | Medium | CISO + Team Leads |
| 6 | Establish quarterly tabletop exercise calendar with rotating scenarios for the D&R team | Medium | Nadia Khan + CISO |
| 7 | Draft policy amendment establishing formal annual specialized role refresher requirements distinct from general awareness | Medium | CISO |
| 8 | Administer baseline competency assessment to all specialized role personnel before next training cycle | Medium | Security Team |
