# PR.PS-06_Ex1: Integrate Security Requirements into the SDLC

**Subcategory:** PR.PS-06 --- Secure software development practices are integrated, and their performance is monitored

**NIST SP 800-53 Ref:** SA-03 (System Development Life Cycle), SA-08 (Security and Privacy Engineering Principles), SA-15 (Development Process, Standards, and Tools)

## Implementation Example

> Integrate security requirements into each phase of the software development life cycle, including design, implementation, testing, deployment, and maintenance, ensuring that security is a consideration from inception.

## Alma Security Implementation

Alma develops its containerized SaaS platform on AWS EKS using agile sprints in GitLab, but has no formal Secure SDLC policy -- security is addressed ad hoc through developer judgment and code review. No threat modeling is practiced, and security requirements are not systematically identified during design. A $60K SQL Injection Mitigation project (identified via scanning, not yet started) reflects the security debt from this gap; formal SSDLC is planned for Q3 2026.

## Artifacts

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Patch Management Procedure](../../5_Artifacts/Procedures/PROC-patch-management.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
