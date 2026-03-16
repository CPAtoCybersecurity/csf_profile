# PR.AA-05 Ex1: Role-Based Access Control and Least Privilege

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2, AC-3, AC-6, AC-6(1), AC-6(5)

## Implementation Example

> Defining and enforcing role-based access control (RBAC) policies that assign minimum necessary permissions based on job function, ensuring users cannot access resources beyond what their role requires

## Alma Security Implementation

Alma Security enforces role-based access control through Active Directory security groups mapped to approximately 25 standard roles across all departments, with role templates applied during ServiceNow onboarding based on HR-specified job title and department. Each role maps to specific AD groups controlling access to SSO-integrated applications, file shares, and internal tools. In AWS, least privilege is enforced through IAM policies attached to roles with permission boundaries in the production account, and Kubernetes RBAC uses ClusterRoles and RoleBindings with namespace-level isolation for developer, operator, and administrator personas. Quarterly access recertification campaigns verify entitlement alignment with current job responsibilities.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Access Management Policy | SharePoint > Policies > InfoSec | 2026-01-15 |
| Role-entitlement matrix | Security Team > IAM > Role Matrix | 2026-02-15 |
| Active Directory group membership audit | AD > Security Groups Export | 2026-03-01 |
| AWS IAM policy inventory with permission boundaries | AWS IAM > Policies | 2026-03-01 |
| Kubernetes RBAC configuration | EKS > ClusterRoles and RoleBindings | 2026-02-15 |
| Q4 2025 access recertification results | ServiceNow > Access Reviews | 2026-01-31 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 12% of AD group memberships reflect access creep from role changes | Users hold permissions beyond current role requirements, violating least privilege | Implement automated entitlement removal on role change; conduct one-time access cleanup campaign | Chris Magann | 2026-06-30 |
| Access recertification remediation rate at 72% (target: 95%) | 28% of identified excessive entitlements persist after recertification review | Implement automated access revocation for recertification-flagged entitlements with SLA tracking | Gerry | 2026-07-31 |
| No attribute-based access control (ABAC) for dynamic access decisions | RBAC alone cannot address context-dependent access needs (location, device health, time) | Evaluate ABAC implementation for high-sensitivity applications; pilot conditional access policies in SSO | Nadia Khan | 2026-09-30 |
