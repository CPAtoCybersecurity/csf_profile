# PR.AA-01 Ex2: Automating Identity Lifecycle Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-4, IA-5, IA-12

## Implementation Example

> Automating identity lifecycle management through provisioning and deprovisioning of accounts, including revocation of credentials upon personnel departure or role change

## Alma Security Implementation

Alma Security automates identity lifecycle management through a Workday-to-ServiceNow integration pipeline that triggers account provisioning, modification, and deprovisioning based on HR record changes. Active Directory account creation, group membership assignment, and SSO enrollment are automated for standard roles, covering approximately 80% of onboarding scenarios. Engineering roles require additional manual provisioning for AWS IAM, Kubernetes namespace access, and GitHub organization membership. Deprovisioning automation disables Active Directory accounts, revokes SSO sessions, and configures email forwarding, though AWS IAM and Kubernetes RBAC removal currently require manual intervention.

## Artifacts

- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
- [Access Review Procedure](../../Artifacts/Procedures/PROC-access-review.md)
