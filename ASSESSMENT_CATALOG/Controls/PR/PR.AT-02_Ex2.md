# PR.AT-02_Ex2: Provide Role-Based Training to Specialized Roles

**Subcategory:** PR.AT-02 — Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-03 (Role-Based Training), AT-02 (Literacy Training and Awareness)

## Implementation Example

> Provide role-based, specialized cybersecurity training to individuals in designated roles, covering tools, procedures, and threats specific to their responsibilities.

## Alma Security Implementation

Alma Security provides role-based training to specialized security personnel, though the program is inconsistently structured across teams. The D&R team under Nadia Khan receives the most structured specialized training, including SentinelOne EDR console training provided by the vendor, internal incident response procedure walkthroughs, and participation in tabletop exercises. Nadia Khan coordinates training schedules for her team and tracks completion informally via shared spreadsheets rather than through the centralized Workday platform.

The vulnerability management team, specifically Chris Magann and Tigan Wang, receives training primarily through vendor-provided resources for their scanning tools, supplemented by attendance at external webinars and conferences on vulnerability management practices. Chris Magann has pursued GIAC certifications independently, which Alma partially funds through the professional development budget. However, there is no formal VM-specific training curriculum that maps to the team's day-to-day responsibilities with Alma's AWS and on-premises Windows domain controller infrastructure.

System and network administrators receive Palo Alto firewall training and AWS security services training on an as-needed basis, typically when new features or configurations are deployed. Developer security training is limited to optional lunch-and-learn sessions organized by the security team. The overall gap is that while specialized training occurs, it is driven by individual initiative and team-level decisions rather than a centralized, role-mapped training program managed through Workday. The security team recognizes this gap and is planning a formalized role-based training catalog for Q2-Q3 2026.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SentinelOne vendor training completion records for D&R team | Nadia Khan / Vendor portal | 2026-03-05 |
| Incident response tabletop exercise records | Security team documentation | 2026-02-15 |
| VM team vendor training and conference attendance records | Chris Magann / Expense reports | 2026-03-01 |
| GIAC certification records (Chris Magann) | GIAC portal | 2026-01-20 |
| Palo Alto firewall training records for network admin | Training vendor records | 2026-02-10 |
| Developer security lunch-and-learn attendance | Security team records | 2026-03-08 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Gap |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Specialized training is tracked outside Workday in team-level spreadsheets | High — no centralized visibility into who has completed what; audit trail is fragmented | Migrate all specialized training tracking into Workday Learning with role-based curricula | Security Team + HR | Q3 2026 |
| No formal training curriculum for VM team mapped to their tools and responsibilities | Medium — training is ad-hoc and dependent on individual motivation | Develop VM-specific training plan covering scanning tools, CVSS scoring, AWS security, and patch management | Chris Magann + CISO | Q2 2026 |
| Developer security training is optional and unstructured | Medium — developers with production access or security-adjacent code lack mandatory skill-building | Establish mandatory developer security training track (OWASP Top 10, secure coding, dependency scanning) | Security Team + Engineering Lead | Q3 2026 |
