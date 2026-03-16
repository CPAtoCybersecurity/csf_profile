# PR.AA-05 Ex1: Role-Based Access Control and Least Privilege

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2, AC-3, AC-6, AC-6(1), AC-6(5)

## Implementation Example

> Defining and enforcing role-based access control (RBAC) policies that assign minimum necessary permissions based on job function, ensuring users cannot access resources beyond what their role requires

## Alma Security Implementation

Alma Security implements role-based access control through Active Directory security groups mapped to job functions and department assignments. The IAM team maintains a role-entitlement matrix that defines approximately 25 standard roles across engineering, product, sales, customer success, HR, finance, and IT. Each role maps to specific Active Directory groups, which in turn control access to SSO-integrated applications, file shares, and internal tools. When an employee is provisioned through the ServiceNow onboarding workflow, the HR-specified job title and department determine which role template is applied.

In the AWS environment, the Cloud Platform team enforces least privilege through IAM policies attached to roles rather than individual users. The production AWS account uses permission boundaries to prevent privilege escalation, and developers in the staging and development accounts have broader permissions scoped to their team's namespaces. Kubernetes RBAC in the EKS cluster mirrors the role structure, with ClusterRoles and RoleBindings defined for developer, operator, and administrator personas. Namespace-level isolation ensures engineering teams can only access their own deployments and secrets.

The Access Management Policy, owned by Gerry, documents the RBAC framework and least privilege principles. However, the Q1 2026 assessment identified that 12% of Active Directory group memberships were accumulated through role changes without proper removal of prior role entitlements, a classic "access creep" pattern. The quarterly access recertification campaign in Q4 2025 achieved 95% completion but the remediation rate for identified excessive access was only 72%, with 28% of flagged entitlements still awaiting removal at the end of Q1 2026.

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
