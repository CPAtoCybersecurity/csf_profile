# PR.AA-04 Ex2: Token Lifecycle Management and Expiration

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-5, SC-23, AC-12

## Implementation Example

> Managing the lifecycle of identity tokens and assertions including issuance, expiration, refresh, and revocation to limit the window of exposure from compromised credentials or stolen tokens

## Alma Security Implementation

Alma Security manages token lifecycles through the Windows Authenticator SSO platform and Active Directory with tiered expiration policies. SSO access tokens expire after 1 hour for standard applications and 30 minutes for high-sensitivity applications (AWS Console, ServiceNow admin), with refresh tokens expiring after 24 hours of inactivity or 7 days absolute maximum. Kerberos TGTs are set to 10-hour lifetimes with 7-day renewal periods, aligned to CIS Benchmarks for Windows Server. Token revocation is handled through SSO session termination via the administrative console, with the ability to revoke all active sessions for a specific user within minutes.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SSO token expiration configuration | Windows Authenticator Admin > Session Settings | 2026-02-01 |
| Token policy change request (Q4 2025 tightening) | ServiceNow > Change Management > CHG-2025-0892 | 2025-11-15 |
| Kerberos ticket lifetime GPO settings | AD > Group Policy Management > Default Domain Policy | 2026-02-15 |
| Session revocation tabletop exercise results | Security Team > Exercise Reports > Feb 2026 | 2026-02-28 |
| AWS SAML session duration configuration | AWS IAM > Identity Providers > Trust Policy | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Applications caching tokens locally may grant access up to 1 hour after session revocation | Compromised accounts retain access for up to 1 hour after revocation action | Implement back-channel logout (OIDC) or token introspection for critical applications to enable real-time revocation | Chris Magann | 2026-08-31 |
| No centralized dashboard for active session monitoring | Cannot determine how many active sessions exist for a given user across all integrated applications | Build session monitoring dashboard aggregating SSO, AWS, and ServiceNow active session data | Nadia Khan | 2026-07-31 |
| Kubernetes service account tokens do not have centralized lifecycle management | K8s tokens may persist beyond intended use; no single pane for token inventory | Implement projected service account tokens with bound audiences and expiration across all namespaces | Tigan Wang | 2026-09-30 |
