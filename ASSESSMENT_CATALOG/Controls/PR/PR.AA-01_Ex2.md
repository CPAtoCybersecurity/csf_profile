# PR.AA-01 Ex2: Automating Identity Lifecycle Management

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-4, IA-5, IA-12

## Implementation Example

> Automating identity lifecycle management through provisioning and deprovisioning of accounts, including revocation of credentials upon personnel departure or role change

## Alma Security Implementation

Alma Security has partially automated identity lifecycle management through a Workday-to-ServiceNow integration pipeline. When HR creates or modifies an employee record in Workday, the integration triggers corresponding ServiceNow catalog items for account provisioning, modification, or deprovisioning. Active Directory account creation on the Windows Domain Controller is automated for standard employee roles, including group membership assignment based on department and job title mappings maintained by IT.

The automation covers approximately 80% of standard onboarding scenarios. Engineering roles require additional manual steps for AWS IAM user creation, Kubernetes namespace access grants, and GitHub organization membership, which are handled through separate ServiceNow tasks assigned to the Cloud Platform team. The MFA Rollout project ($80K budget) is extending automation to include Windows Authenticator enrollment as part of the provisioning pipeline, targeting 100% automated MFA enrollment by Q3 2026.

Deprovisioning automation is more mature: the Workday termination event triggers immediate Active Directory account disablement, SSO session revocation, and email forwarding configuration. However, AWS IAM access and Kubernetes RBAC removal still require manual intervention, creating a gap of 24-48 hours where departed employees may retain cloud access. The security team, led by Nadia Khan, has flagged this as a priority remediation item and proposed an AWS Lambda-based automation to bridge the gap.

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
