# PR.AA-05 Ex1: Role-Based Access Control and Least Privilege

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2, AC-3, AC-6, AC-6(1), AC-6(5)

## Implementation Example

> Defining and enforcing role-based access control (RBAC) policies that assign minimum necessary permissions based on job function, ensuring users cannot access resources beyond what their role requires

## Alma Security Implementation

Alma Security enforces role-based access control through Active Directory security groups mapped to approximately 25 standard roles across all departments, with role templates applied during ServiceNow onboarding based on HR-specified job title and department. Each role maps to specific AD groups controlling access to SSO-integrated applications, file shares, and internal tools. In AWS, least privilege is enforced through IAM policies attached to roles with permission boundaries in the production account, and Kubernetes RBAC uses ClusterRoles and RoleBindings with namespace-level isolation for developer, operator, and administrator personas. Quarterly access recertification campaigns verify entitlement alignment with current job responsibilities.

## Artifacts

- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- [Access Review Procedure](../../5_Artifacts/Procedures/PROC-access-review.md)
- [Access Certification Report Q4](../../5_Artifacts/Reports/RPT-access-certification-q4.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
