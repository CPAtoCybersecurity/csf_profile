# PR.PS-06_Ex1: Integrate Security Requirements into the SDLC

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-03 (System Development Life Cycle), SA-08 (Security and Privacy Engineering Principles), SA-15 (Development Process, Standards, and Tools)

## Implementation Example

> Integrate security requirements into each phase of the software development life cycle, including design, implementation, testing, deployment, and maintenance, ensuring that security is a consideration from inception.

## Alma Security Implementation

Alma Security's development team builds and maintains a containerized SaaS platform deployed on AWS EKS. The development process follows an agile methodology using two-week sprints, with code managed in GitLab. While the engineering team follows established software development practices, there is no formalized Secure Software Development Lifecycle (SSDLC) policy or standards document. Security considerations are addressed informally through developer judgment and code review practices rather than through structured, mandated processes.

Security requirements for new features are occasionally captured in Jira stories when the feature involves sensitive data handling or authentication changes, but there is no systematic process for identifying security requirements during the design phase. Threat modeling is not practiced; the engineering team does not conduct formal threat assessments for new features or architectural changes. Design reviews focus on functionality, scalability, and code quality, with security considerations raised ad hoc by security-aware developers.

The absence of a formal SSDLC is reflected in the SQL Injection Mitigation project, a $60K remediation effort that was identified through vulnerability scanning but has not yet started. This project represents a class of security debt that could have been prevented through earlier integration of security requirements into the development process. The CISO has flagged the establishment of a formal SSDLC as a priority for Q3 2026, aligned with the broader SOC 2 readiness roadmap.

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
