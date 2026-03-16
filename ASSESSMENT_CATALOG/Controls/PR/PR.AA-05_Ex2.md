# PR.AA-05 Ex2: Privileged Access Management

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2(7), AC-6(1), AC-6(2), AC-6(5), AC-6(10)

## Implementation Example

> Implementing privileged access management (PAM) controls including separate privileged accounts, just-in-time access, session recording, and elevated monitoring for administrative activities

## Alma Security Implementation

Alma Security manages privileged access through Active Directory tiered administration and AWS IAM role-based elevation. On-premises privileged accounts (adm-[username]) reside in a separate OU with restrictive GPO settings preventing interactive logon to standard workstations and requiring hardware token authentication, with Domain Admin membership limited to 4 individuals and reviewed monthly. AWS production privileged access requires assuming IAM roles through SAML federation with MFA re-authentication, with CloudTrail logging all API calls and GuardDuty alerting on anomalous privileged activity patterns. Audit trails for privileged actions are provided through CloudTrail and Windows Security Event logs.

## Artifacts

- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Access Review Procedure](../../Artifacts/Procedures/PROC-access-review.md)
- [Service Account Inventory](../../Artifacts/Inventories/INV-service-accounts.md)
- [Access Certification Report Q4](../../Artifacts/Reports/RPT-access-certification-q4.md)
