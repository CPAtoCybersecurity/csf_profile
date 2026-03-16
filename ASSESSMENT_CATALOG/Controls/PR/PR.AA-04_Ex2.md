# PR.AA-04 Ex2: Token Lifecycle Management and Expiration

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-5, SC-23, AC-12

## Implementation Example

> Managing the lifecycle of identity tokens and assertions including issuance, expiration, refresh, and revocation to limit the window of exposure from compromised credentials or stolen tokens

## Alma Security Implementation

Alma Security manages identity assertion lifecycles through configured policies at the Windows Authenticator SSO platform and Active Directory. SSO access tokens are issued with a 1-hour expiration for standard applications, with high-sensitivity applications (AWS Console, ServiceNow admin) configured for 30-minute token lifetimes. Refresh tokens have a 24-hour inactivity timeout and a 7-day absolute maximum lifetime, after which users must re-authenticate with full MFA. These settings were tightened in Q4 2025 from the previous 8-hour access token and 30-day refresh token configuration, based on a recommendation from Nadia Khan after reviewing industry threat intelligence on session hijacking attacks.

Kerberos ticket lifetimes in Active Directory are set to 10 hours for TGTs (Ticket Granting Tickets) with a 7-day maximum renewal period. Service tickets inherit the TGT lifetime constraints. The security team reviewed these settings against CIS Benchmarks for Windows Server and confirmed alignment with recommended values.

Token revocation is handled through SSO session termination. When a security incident is detected or an employee is terminated, the IT team can revoke all active SSO sessions for a specific user within minutes through the administrative console. This was tested during a tabletop exercise in February 2026, where the team demonstrated the ability to terminate all sessions for a compromised account in under 5 minutes. However, applications that cache tokens locally may continue to grant access until the cached token expires, which represents a gap for the 1-hour access token window. AWS session tokens issued through SAML federation inherit the 1-hour maximum session duration configured in the IAM trust policy.

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
