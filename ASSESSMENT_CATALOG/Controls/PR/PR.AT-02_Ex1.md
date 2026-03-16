# PR.AT-02_Ex1: Identify Specialized Roles Requiring Additional Training

**Subcategory:** PR.AT-02 — Individuals in specialized roles are provided with awareness and training so that they possess the knowledge and skills to perform relevant tasks with cybersecurity risks in mind

**NIST SP 800-53 Ref:** AT-01 (Policy and Procedures), AT-03 (Role-Based Training)

## Implementation Example

> Identify individuals in specialized roles that require additional, role-specific cybersecurity training beyond general awareness.

## Alma Security Implementation

Alma Security has informally designated several roles as requiring specialized cybersecurity training, but does not yet maintain a formal role classification matrix or policy document that explicitly defines the criteria for specialized training designation. The security team, working with HR, has identified the following roles as requiring training beyond the standard quarterly awareness program: Detection and Response (D&R) analysts, vulnerability management specialists, system and network administrators, DevSecOps engineers, and personnel with privileged access to production infrastructure.

The D&R team, led by Nadia Khan, currently consists of analysts who require specialized training on SentinelOne EDR operations, incident handling procedures, threat intelligence analysis, and forensic triage. The vulnerability management team, including Chris Magann and Tigan Wang, requires specialized training on vulnerability scanning tools, CVSS scoring methodologies, patch prioritization, and risk-based remediation workflows. System administrators require training on Windows Authenticator SSO configuration, AWS security services, and Palo Alto firewall management.

While these designations exist in practice and are recognized by security leadership, the lack of a formalized role classification document means the identification process is dependent on institutional knowledge rather than a repeatable, auditable process. New roles created as Alma scales from 300 employees may not be automatically evaluated for specialized training requirements. The security team plans to formalize this into a documented matrix aligned to NIST SP 800-53 AT-03 requirements by Q2 2026.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Informal specialized role list maintained by security team | Security team internal documentation | 2026-03-05 |
| D&R team roster with training requirements | Nadia Khan / Security team org chart | 2026-03-05 |
| VM team roster with training requirements | Chris Magann / Security team org chart | 2026-03-05 |
| Privileged access account list (indicates roles with elevated access) | ServiceNow / IAM records | 2026-02-28 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Gap |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal role classification matrix defining specialized training criteria | High — identification is ad-hoc and dependent on institutional knowledge; new roles may be missed | Create documented role classification matrix with criteria for specialized designation, reviewed annually | CISO + HR | Q2 2026 |
| DevSecOps and developer roles not yet formally included in specialized training scope | Medium — developers with production access or security tool responsibilities lack designated training paths | Extend specialized role designation to include DevSecOps engineers and senior developers with production access | Security Team | Q2 2026 |
