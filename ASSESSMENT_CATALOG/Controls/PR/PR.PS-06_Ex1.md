# PR.PS-06_Ex1: Integrate Security Requirements into the SDLC

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-03 (System Development Life Cycle), SA-08 (Security and Privacy Engineering Principles), SA-15 (Development Process, Standards, and Tools)

## Implementation Example

> Integrate security requirements into each phase of the software development life cycle, including design, implementation, testing, deployment, and maintenance, ensuring that security is a consideration from inception.

## Alma Security Implementation

Alma develops its containerized SaaS platform on AWS EKS using agile sprints in GitLab, but has no formal Secure SDLC policy -- security is addressed ad hoc through developer judgment and code review. No threat modeling is practiced, and security requirements are not systematically identified during design. A $60K SQL Injection Mitigation project (identified via scanning, not yet started) reflects the security debt from this gap; formal SSDLC is planned for Q3 2026.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Development process documentation (agile workflow) | Confluence engineering wiki | 2026-02-15 |
| GitLab repository structure and branching strategy | GitLab | 2026-03-10 |
| Jira security-related story examples | Jira | 2026-03-12 |
| SQL Injection Mitigation project documentation ($60K, not started) | Jira project board / risk register | 2026-03-01 |
| SSDLC roadmap (planned Q3 2026) | CISO quarterly plan | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 2 | 5 | At Risk |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No formal SSDLC policy or standards document | Critical --- security requirements not systematically identified or tracked | Develop and implement SSDLC policy aligned to NIST SP 800-218 (SSDF) | Chris Magann | Q3 2026 |
| No threat modeling practice for new features or architecture changes | High --- security risks identified reactively through scanning rather than proactively in design | Implement lightweight threat modeling for security-sensitive features | Chris Magann | Q3 2026 |
| SQL Injection Mitigation project not started ($60K remediation) | Critical --- known vulnerability class unaddressed in production application | Prioritize and begin SQL injection remediation project | Chris Magann | Q2 2026 |
