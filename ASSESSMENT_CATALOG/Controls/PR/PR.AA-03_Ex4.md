# PR.AA-03 Ex4: Directory Services and Single Sign-On Authentication

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-5, IA-8

## Implementation Example

> Centralizing authentication through directory services and single sign-on (SSO) to provide consistent authentication enforcement, reduce credential sprawl, and enable centralized monitoring of authentication events

## Alma Security Implementation

Alma Security centralizes authentication through Windows Authenticator SSO integrated with on-premises Active Directory, providing federated authentication via SAML and OIDC tokens to approximately 35 SaaS applications and internal tools. Active Directory serves as the authoritative identity source for approximately 350 user objects, with GPOs enforcing password complexity (14-character minimum), account lockout (5 attempts, 30-minute lockout), and session timeout policies, using Kerberos authentication with NTLMv1 and LM protocols disabled. Authentication events are forwarded to the SIEM via Windows Security Event logs, with alerting for brute-force attempts, after-hours authentication, and privileged account usage. AWS management console access is federated through SSO using SAML 2.0 with MFA enforcement.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SSO application integration inventory | Windows Authenticator Admin Console | 2026-03-01 |
| Active Directory GPO password policy settings | AD > Group Policy Management | 2026-02-15 |
| NTLM restriction GPO configuration | AD > Group Policy Management | 2026-02-15 |
| Authentication event SIEM forwarding config | SIEM > Data Sources > Windows AD | 2026-03-01 |
| AWS SAML federation configuration | AWS IAM > Identity Providers | 2026-02-01 |
| AWS IAM access key usage report | AWS IAM > Credential Report | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| 5 AWS IAM accounts use long-lived access keys instead of SSO-based temporary credentials | Static credentials increase risk of key compromise; bypass MFA enforcement | Migrate remaining IAM users to AWS IAM Identity Center with SSO-federated temporary credentials | Tigan Wang | 2026-06-30 |
| 3 legacy applications not integrated with SSO | Users maintain separate credentials for these applications, creating credential sprawl and bypass risk | Evaluate SSO integration for legacy apps; implement SAML or OIDC connectors where supported | Chris Magann | 2026-08-31 |
| Authentication event correlation across on-prem and cloud not unified | Fragmented visibility; difficult to detect credential stuffing attacks spanning both environments | Consolidate on-prem AD and AWS CloudTrail authentication logs into single SIEM correlation view | Nadia Khan | 2026-07-31 |
