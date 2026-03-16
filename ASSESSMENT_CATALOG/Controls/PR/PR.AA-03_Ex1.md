# PR.AA-03 Ex1: Multi-Factor Authentication Enforcement

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-2(1), IA-2(2), IA-2(6)

## Implementation Example

> Requiring multi-factor authentication (MFA) for access to organizational systems and resources, with phishing-resistant factors prioritized for privileged access and remote connectivity

## Alma Security Implementation

Alma Security enforces MFA through Windows Authenticator SSO for all cloud application access and VPN connections, with enrollment at approximately 85% of the employee population as of Q1 2026. Standard MFA factors include push notifications via the Windows Authenticator mobile app and TOTP codes as fallback, while privileged access to the Windows Domain Controller and AWS administrative consoles requires FIDO2-compliant hardware security keys. SMS-based MFA is explicitly prohibited in the authentication policy. The MFA Rollout project (Phase 2 of 3) is extending phishing-resistant hardware key requirements to all IT administrators and engineering leads.

## Artifacts

- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Phishing Simulation Report Q1](../../Artifacts/Reports/RPT-phishing-simulation-q1.md)
