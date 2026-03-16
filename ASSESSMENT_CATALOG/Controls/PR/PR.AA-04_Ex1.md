# PR.AA-04 Ex1: Identity Assertion Signing and Encryption

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-8, IA-9, SC-23

## Implementation Example

> Protecting identity assertions (such as SAML tokens, OAuth tokens, and Kerberos tickets) through cryptographic signing and encryption to prevent tampering, forgery, and interception during transmission between identity providers and relying parties

## Alma Security Implementation

Alma Security protects identity assertions through cryptographic controls at the Windows Authenticator SSO platform, which serves as the primary identity provider for both on-premises and cloud application access. SAML 2.0 assertions issued to integrated SaaS applications are digitally signed using SHA-256 with RSA-2048 certificates. The SSO signing certificate is renewed annually, with the most recent rotation completed in January 2026. For applications that support it, SAML assertions are additionally encrypted using the relying party's public certificate, though this is currently enabled for only 12 of the 35 integrated applications.

OAuth 2.0 and OIDC tokens issued by the SSO platform use RS256 signing with JSON Web Keys (JWK) published at a well-known endpoint. Access tokens are configured with a 1-hour expiration, and refresh tokens expire after 24 hours of inactivity. The security team evaluated and rejected HS256 (symmetric signing) for all public-facing clients due to the shared secret risk. Token audiences are restricted to specific client IDs, preventing token reuse across applications.

On-premises Kerberos authentication through Active Directory uses AES-256 encryption for ticket-granting tickets and service tickets. The security team disabled RC4 (ARCFOUR) encryption types through Group Policy in Q3 2025 after Chris Magann's vulnerability management team identified RC4 as a risk vector for Kerberoasting attacks. The Kerberos ticket lifetime is configured at 10 hours with a 7-day renewal window. AWS API calls use SigV4 (Signature Version 4) signing for all requests, which provides message integrity and authentication at the API layer.

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
