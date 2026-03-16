# PR.AA-02 Ex2: Credential Uniqueness and Individual Accountability

**Subcategory:** PR.AA-02 — Identities are proofed and bound to credentials based on the context of interactions

**NIST SP 800-53 Ref:** IA-4, IA-5, IA-8, AC-2

## Implementation Example

> Ensuring that each authenticated individual or service has unique credentials that are not shared, maintaining individual accountability for all actions performed

## Alma Security Implementation

Alma Security enforces credential uniqueness through the Information Security Policy and technical controls in Windows Authenticator SSO, which binds one-to-one identity-to-credential relationships for all enterprise applications. Each employee and contractor receives a unique Active Directory account with an individually assigned UPN serving as the primary identifier across integrated systems. Administrators maintain separate privileged accounts (adm-[username]) distinct from standard accounts, and the IAM team conducts quarterly privileged access reviews through ServiceNow to verify individual ownership and business justification. MFA enrollment requires individually registered hardware tokens or authenticator app instances tied to each user's identity.

## Artifacts

- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Access Certification Report Q4](../../Artifacts/Reports/RPT-access-certification-q4.md)
- [Service Account Inventory](../../Artifacts/Inventories/INV-service-accounts.md)
