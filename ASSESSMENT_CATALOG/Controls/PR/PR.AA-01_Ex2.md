# PR.AA-01 Ex2: Automating Identity Lifecycle Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-4, IA-5, IA-12

## Implementation Example

> Automating identity lifecycle management through provisioning and deprovisioning of accounts, including revocation of credentials upon personnel departure or role change

## Alma Security Implementation

Alma Security automates identity lifecycle management through a Workday-to-ServiceNow integration pipeline that triggers account provisioning, modification, and deprovisioning based on HR record changes. Active Directory account creation, group membership assignment, and SSO enrollment are automated for standard roles, covering approximately 80% of onboarding scenarios. Engineering roles require additional manual provisioning for AWS IAM, Kubernetes namespace access, and GitHub organization membership. Deprovisioning automation disables Active Directory accounts, revokes SSO sessions, and configures email forwarding, though AWS IAM and Kubernetes RBAC removal currently require manual intervention.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Workday-ServiceNow integration documentation | ServiceNow > Integration Hub | 2026-02-01 |
| Automated provisioning workflow logs | ServiceNow > Workflow History | 2026-03-01 |
| AD account creation automation scripts | IT > PowerShell Repository | 2026-01-15 |
| Deprovisioning SLA compliance report | ServiceNow > Reports | 2026-02-28 |
| MFA Rollout project plan | PMO > Active Projects | 2026-01-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| AWS IAM and Kubernetes deprovisioning not automated | 24-48 hour window where terminated employees retain cloud access | Deploy AWS Lambda function triggered by ServiceNow webhook to automate IAM user deletion and K8s RBAC removal | Nadia Khan | 2026-06-30 |
| Engineering role provisioning requires manual steps | Delays onboarding for engineering hires; inconsistent access configuration | Extend ServiceNow automation to include AWS IAM, K8s namespace, and GitHub provisioning | Tigan Wang | 2026-07-31 |
| MFA auto-enrollment not yet in provisioning pipeline | New hires may operate without MFA during enrollment gap | Complete MFA Rollout project integration with provisioning workflow | Chris Magann | 2026-09-30 |
