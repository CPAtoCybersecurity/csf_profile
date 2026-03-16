# PR.AA-03 Ex4: Directory Services and Single Sign-On Authentication

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-5, IA-8

## Implementation Example

> Centralizing authentication through directory services and single sign-on (SSO) to provide consistent authentication enforcement, reduce credential sprawl, and enable centralized monitoring of authentication events

## Alma Security Implementation

Alma Security centralizes user authentication through the Windows Authenticator SSO platform integrated with the on-premises Active Directory running on the Windows Domain Controller in the Redwood City office. The SSO configuration provides federated authentication to approximately 35 SaaS applications and internal tools. Users authenticate once to Active Directory, and the SSO platform issues SAML assertions or OIDC tokens to integrated applications. This architecture reduces credential sprawl by eliminating application-specific passwords for SSO-integrated applications and provides a single enforcement point for password policy, MFA requirements, and conditional access rules.

Active Directory serves as the authoritative identity source with approximately 350 user objects (300 employees plus contractors and service accounts). Group Policy Objects enforce password complexity (minimum 14 characters, complexity enabled), account lockout (5 failed attempts, 30-minute lockout), and session timeout policies. Kerberos authentication is used for on-premises Windows resources, with NTLMv2 as a fallback for legacy applications. The security team has disabled NTLMv1 and LM authentication protocols through GPO. Nadia Khan's Detection and Response team monitors authentication events through Windows Security Event logs forwarded to the SIEM, with alerting configured for brute-force attempts, after-hours authentication, and privileged account usage.

AWS authentication for the management console is federated through the SSO platform using SAML 2.0, providing consistent MFA enforcement for cloud administration. However, AWS CLI access for developers currently uses long-lived IAM access keys for 5 accounts that have not been migrated to SSO-based temporary credentials via AWS SSO (IAM Identity Center). The Cloud Platform team has prioritized this migration as part of the cloud security optimization project, targeting completion by Q2 2026.

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
