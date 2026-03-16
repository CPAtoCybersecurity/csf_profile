# PR.AA-03 Ex3: SSH Key and Certificate-Based Authentication

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-5, IA-5(2)

## Implementation Example

> Managing SSH keys, certificates, and other cryptographic credentials used for user and service authentication, including key generation, distribution, rotation, and revocation procedures

## Alma Security Implementation

Alma Security manages SSH access to AWS infrastructure through EC2 Instance Connect and AWS Systems Manager Session Manager, reducing reliance on persistent SSH keys for interactive server access. EKS worker node access is managed through Kubernetes RBAC with kubectl exec, and direct SSH is restricted via security groups to the bastion host only. A shared developer SSH key on port 45001 exists for production database access by approximately 8 developers, with network monitoring on that port through the Palo Alto firewall for session logging. The planned migration to HashiCorp Vault as an SSH certificate authority will replace the shared key with short-lived individual certificates issued via SSO-authenticated requests.

## Artifacts

- [Encryption Standards Policy](../../Artifacts/Policies/POL-encryption-standards.md)
- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Vulnerability Scan Summary Report](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
