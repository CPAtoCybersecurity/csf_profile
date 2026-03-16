# PR.AA-04 Ex1: Identity Assertion Signing and Encryption

**Subcategory:** PR.AA-04 — Identity assertions are protected, conveyed, and verified

**NIST SP 800-53 Ref:** IA-8, IA-9, SC-23

## Implementation Example

> Protecting identity assertions (such as SAML tokens, OAuth tokens, and Kerberos tickets) through cryptographic signing and encryption to prevent tampering, forgery, and interception during transmission between identity providers and relying parties

## Alma Security Implementation

Alma Security protects identity assertions through cryptographic controls across the SSO platform, Active Directory, and AWS. SAML 2.0 assertions are digitally signed using SHA-256 with RSA-2048 certificates (renewed annually) and encrypted with relying party certificates for 12 of 35 integrated applications. OAuth 2.0 and OIDC tokens use RS256 signing with 1-hour access token and 24-hour refresh token expiration, with audience restrictions preventing cross-application token reuse. On-premises Kerberos uses AES-256 encryption for all tickets with RC4 disabled via GPO, and AWS API calls use SigV4 signing for message integrity.

## Artifacts

- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
