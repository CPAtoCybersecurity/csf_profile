# PR.AA-01 Ex1: Integrating Identity Management into Policies and Procedures

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-1, IA-2, IA-3, IA-4, IA-5, IA-8

## Implementation Example

> Integrating the management of identities, credentials (e.g., passwords, certificates, keys), and identity assertions (e.g., SAML tokens, Kerberos tickets) into onboarding, offboarding, role-change, and credential-recovery procedures

## Alma Security Implementation

Alma Security manages identity and credential lifecycle through Workday-to-ServiceNow integration workflows covering onboarding, offboarding, role changes, and credential recovery. Provisioning creates Active Directory accounts on the Windows Domain Controller, assigns RBAC group memberships, enrolls users in Windows Authenticator SSO, and triggers MFA enrollment, with each step gated on manager approval and identity verification. Offboarding triggers same-day account disablement, SSO session revocation, AWS IAM access removal, and badge deactivation. Credential recovery requires help desk identity verification via challenge-response protocol before password resets or MFA re-enrollment.

## Artifacts

- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Service Account Inventory](../../Artifacts/Inventories/INV-service-accounts.md)
