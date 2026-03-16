# PR.AA-04 Ex1: Identity Assertion Signing and Encryption

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-8, IA-9, SC-23

## Implementation Example

> Protecting identity assertions (such as SAML tokens, OAuth tokens, and Kerberos tickets) through cryptographic signing and encryption to prevent tampering, forgery, and interception during transmission between identity providers and relying parties

## Alma Security Implementation

Alma Security protects identity assertions through cryptographic controls across the SSO platform, Active Directory, and AWS. SAML 2.0 assertions are digitally signed using SHA-256 with RSA-2048 certificates (renewed annually) and encrypted with relying party certificates for 12 of 35 integrated applications. OAuth 2.0 and OIDC tokens use RS256 signing with 1-hour access token and 24-hour refresh token expiration, with audience restrictions preventing cross-application token reuse. On-premises Kerberos uses AES-256 encryption for all tickets with RC4 disabled via GPO, and AWS API calls use SigV4 signing for message integrity.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SSO SAML signing certificate and configuration | Windows Authenticator Admin > Certificates | 2026-01-15 |
| OAuth/OIDC token signing configuration (RS256) | Windows Authenticator Admin > Token Settings | 2026-02-01 |
| Kerberos encryption type GPO (AES-256 only) | AD > Group Policy Management | 2025-09-15 |
| Token expiration policy documentation | Security Policy > Authentication Standards | 2026-01-15 |
| AWS SigV4 configuration (default, no action required) | AWS Documentation | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| SAML assertion encryption enabled for only 12 of 35 applications | Assertions for 23 applications are signed but transmitted in plaintext, visible to network observers | Enable SAML assertion encryption for all applications that support it; document exceptions for apps that do not | Chris Magann | 2026-07-31 |
| SSO signing certificate uses RSA-2048; industry moving to stronger keys | RSA-2048 remains acceptable but provides diminishing margin against future cryptanalytic advances | Plan migration to RSA-3072 or ECDSA P-256 signing certificates at next annual rotation (Jan 2027) | Tigan Wang | 2027-01-31 |
| No automated monitoring for assertion signing failures | Signing failures at the IdP could result in unsigned assertions accepted by misconfigured relying parties | Implement alerting on SSO assertion signing errors and relying party signature validation failures | Nadia Khan | 2026-06-30 |
