# PR.AA-04: Identity Assertion Protection — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed SSO SAML signing certificate configuration, OAuth/OIDC token settings, Active Directory Kerberos encryption GPO, AWS IAM SAML federation trust policies, federation inventory spreadsheet, token expiration configurations |
| Interview | Yes | Interviewed Tigan Wang on AWS federation architecture and cross-account trust policies; Chris Magann on assertion signing and Kerberos configuration hardening; Nadia Khan on assertion monitoring and session revocation capabilities |
| Test | Yes | Verified SAML assertion signing on 3 application integrations; tested token expiration by inspecting OAuth token claims; confirmed Kerberos AES-256 enforcement through GPO export; reviewed AWS CloudTrail for SAML federation events |

---

## Findings

Alma Security protects identity assertions through cryptographic signing at the Windows Authenticator SSO platform and Active Directory Kerberos infrastructure. SAML 2.0 assertions are digitally signed using SHA-256 with RSA-2048, verified through examination of 3 integrated application configurations. OAuth 2.0 access tokens use RS256 signing with 1-hour expiration, tightened from the previous 8-hour setting in Q4 2025. Kerberos encryption has been hardened to AES-256 only, with RC4 (ARCFOUR) disabled through GPO since Q3 2025 to mitigate Kerberoasting risk.

Token lifecycle management shows improvement: the Q4 2025 tightening of token expiration settings (access tokens from 8 hours to 1 hour, refresh tokens from 30 days to 24-hour inactivity / 7-day maximum) significantly reduces the window for session hijacking. The security team demonstrated session revocation capability during a February 2026 tabletop exercise, terminating all active sessions for a simulated compromised account in under 5 minutes. However, applications that cache tokens locally may continue granting access for up to 1 hour after revocation, and back-channel logout (OIDC) is not configured for any integrated applications.

Federation trust management is the weakest area. The federation inventory is maintained in a spreadsheet rather than a centralized configuration management tool. During the assessment, 2 of 35 SaaS application federation configurations were found to have stale metadata that had not been refreshed after the January 2026 SSO certificate rotation. Both applications continued to function because the previous certificate had not yet expired, but the stale metadata creates a risk of federation failure at certificate expiration and indicates a gap in federation lifecycle management.

AWS federation through SAML is properly configured with audience restrictions, issuer validation, and external ID conditions for cross-account role assumption. The 4-account architecture (production, staging, development, shared services) uses role-based trust policies with appropriate scoping. Kubernetes service account tokens in EKS use projected tokens with audience binding, though expiration is not consistently configured across all namespaces.

### Strengths

- SAML assertions digitally signed (SHA-256/RSA-2048) with annual certificate rotation
- OAuth token expiration tightened to 1 hour (from 8 hours) in Q4 2025
- Kerberos hardened to AES-256 only; RC4 disabled to mitigate Kerberoasting
- AWS federation uses external ID conditions to prevent confused deputy attacks
- Session revocation capability demonstrated in under 5 minutes during tabletop exercise
- All assertion transport verified over TLS 1.2+

### Gaps

- SAML assertion encryption enabled for only 12 of 35 integrated applications
- 2 SaaS applications have stale federation metadata after January 2026 certificate rotation
- Federation inventory maintained in spreadsheet, not in ServiceNow CMDB
- Back-channel logout not configured; token caching creates up to 1-hour revocation gap
- Kubernetes service account token expiration not consistently configured across namespaces
- No automated assertion verification testing at relying parties

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

---

## Evidence Reviewed

- SSO SAML signing certificate configuration (SHA-256/RSA-2048)
- OAuth/OIDC token signing settings (RS256, 1-hour expiration)
- Active Directory GPO Kerberos encryption settings (AES-256 enforced)
- AWS IAM SAML identity provider configuration and trust policies
- Federation inventory spreadsheet (35 SaaS applications)
- Token expiration change request (CHG-2025-0892, Q4 2025)
- Session revocation tabletop exercise report (February 2026)
- AWS CloudTrail SAML federation event logs (30-day sample)
- Kubernetes service account token configuration audit

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Refresh stale federation metadata on 2 SaaS applications; implement automated metadata refresh tied to certificate lifecycle | High | Tigan Wang |
| 2 | Enable SAML assertion encryption for all applications that support it; document exceptions | High | Chris Magann |
| 3 | Migrate federation inventory from spreadsheet to ServiceNow CMDB with automated certificate expiration alerting | Medium | Tigan Wang |
| 4 | Implement back-channel logout (OIDC) for critical applications to enable real-time session revocation | Medium | Chris Magann |
| 5 | Standardize Kubernetes projected service account token expiration across all namespaces | Medium | Tigan Wang |
| 6 | Conduct annual assertion verification testing across all 35 integrated relying parties | Low | Nadia Khan |
