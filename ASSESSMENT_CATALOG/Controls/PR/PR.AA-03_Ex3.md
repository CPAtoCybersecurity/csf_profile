# PR.AA-03 Ex3: SSH Key and Certificate-Based Authentication

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-5, IA-5(2)

## Implementation Example

> Managing SSH keys, certificates, and other cryptographic credentials used for user and service authentication, including key generation, distribution, rotation, and revocation procedures

## Alma Security Implementation

Alma Security manages SSH access to AWS infrastructure through EC2 Instance Connect and AWS Systems Manager Session Manager, reducing reliance on persistent SSH keys for interactive server access. EKS worker node access is managed through Kubernetes RBAC with kubectl exec, and direct SSH is restricted via security groups to the bastion host only. A shared developer SSH key on port 45001 exists for production database access by approximately 8 developers, with network monitoring on that port through the Palo Alto firewall for session logging. The planned migration to HashiCorp Vault as an SSH certificate authority will replace the shared key with short-lived individual certificates issued via SSO-authenticated requests.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| AWS Systems Manager Session Manager configuration | AWS Console > SSM > Session Manager | 2026-03-01 |
| EC2 Instance Connect policy | AWS IAM > Policies | 2026-02-15 |
| Bastion host security group configuration | AWS VPC > Security Groups | 2026-02-15 |
| Shared SSH key risk register entry | Risk Register > R-SSH-001 | 2026-02-01 |
| HashiCorp Vault SSH CA project plan | PMO > Planned Projects | 2026-03-01 |
| Port 45001 monitoring rule on Palo Alto | Palo Alto Panorama > Security Policies | 2026-02-20 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 2 | 5 | Significantly Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Shared developer SSH key on port 45001, never rotated | No individual accountability; key compromise would affect all 8 developers; no revocation capability | Deploy HashiCorp Vault SSH CA for short-lived individual certificates; decommission shared key | Chris Magann | 2026-09-30 |
| No SSH key inventory for on-premises systems | Cannot determine total exposure of SSH key-based access across the environment | Conduct SSH key discovery scan across all on-prem and cloud systems; build comprehensive inventory | Tigan Wang | 2026-06-30 |
| SSH key rotation not enforced by policy | Long-lived keys accumulate risk over time; no technical control forces rotation | Define SSH key lifecycle policy with maximum key age; implement Vault-based automated rotation | Gerry | 2026-07-31 |
