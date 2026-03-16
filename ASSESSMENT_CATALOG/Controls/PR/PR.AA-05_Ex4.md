# PR.AA-05 Ex4: Separation of Duties and Conflict-of-Interest Controls

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-5, AC-6, CM-5

## Implementation Example

> Implementing separation of duties (SoD) controls to prevent any single individual from having the ability to perform conflicting or sensitive combinations of functions without oversight, enforced through technical controls and monitored for violations

## Alma Security Implementation

Alma Security enforces separation of duties through Active Directory group membership restrictions, AWS IAM policy conditions, and CI/CD pipeline controls documented in the Access Management Policy. Key SoD controls prevent a single individual from both approving and provisioning access requests in ServiceNow, require separate code reviewer and deployment approver in GitHub Actions production workflows, and enforce dual authorization for financial transactions in the ERP system. Administrative SoD enforcement relies primarily on monthly privileged access reviews to detect conflicting role assignments. The SoD matrix defines incompatible role combinations across identity management, application ownership, and financial approval functions.

## Artifacts

- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
- [Access Review Procedure](../../Artifacts/Procedures/PROC-access-review.md)
