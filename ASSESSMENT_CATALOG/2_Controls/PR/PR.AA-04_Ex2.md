# PR.AA-04 Ex2: Token Lifecycle Management and Expiration

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-5, SC-23, AC-12

## Implementation Example

> Managing the lifecycle of identity tokens and assertions including issuance, expiration, refresh, and revocation to limit the window of exposure from compromised credentials or stolen tokens

## Alma Security Implementation

Alma Security manages token lifecycles through the Windows Authenticator SSO platform and Active Directory with tiered expiration policies. SSO access tokens expire after 1 hour for standard applications and 30 minutes for high-sensitivity applications (AWS Console, ServiceNow admin), with refresh tokens expiring after 24 hours of inactivity or 7 days absolute maximum. Kerberos TGTs are set to 10-hour lifetimes with 7-day renewal periods, aligned to CIS Benchmarks for Windows Server. Token revocation is handled through SSO session termination via the administrative console, with the ability to revoke all active sessions for a specific user within minutes.

## Artifacts

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
