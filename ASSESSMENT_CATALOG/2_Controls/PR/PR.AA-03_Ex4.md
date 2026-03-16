# PR.AA-03 Ex4: Directory Services and Single Sign-On Authentication

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-5, IA-8

## Implementation Example

> Centralizing authentication through directory services and single sign-on (SSO) to provide consistent authentication enforcement, reduce credential sprawl, and enable centralized monitoring of authentication events

## Alma Security Implementation

Alma Security centralizes authentication through Windows Authenticator SSO integrated with on-premises Active Directory, providing federated authentication via SAML and OIDC tokens to approximately 35 SaaS applications and internal tools. Active Directory serves as the authoritative identity source for approximately 350 user objects, with GPOs enforcing password complexity (14-character minimum), account lockout (5 attempts, 30-minute lockout), and session timeout policies, using Kerberos authentication with NTLMv1 and LM protocols disabled. Authentication events are forwarded to the SIEM via Windows Security Event logs, with alerting for brute-force attempts, after-hours authentication, and privileged account usage. AWS management console access is federated through SSO using SAML 2.0 with MFA enforcement.

## Artifacts

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
