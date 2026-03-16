# PR.AA-03 Ex1: Multi-Factor Authentication Enforcement

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-2, IA-2(1), IA-2(2), IA-2(6)

## Implementation Example

> Requiring multi-factor authentication (MFA) for access to organizational systems and resources, with phishing-resistant factors prioritized for privileged access and remote connectivity

## Alma Security Implementation

Alma Security enforces MFA through Windows Authenticator SSO for all cloud application access and VPN connections, with enrollment at approximately 85% of the employee population as of Q1 2026. Standard MFA factors include push notifications via the Windows Authenticator mobile app and TOTP codes as fallback, while privileged access to the Windows Domain Controller and AWS administrative consoles requires FIDO2-compliant hardware security keys. SMS-based MFA is explicitly prohibited in the authentication policy. The MFA Rollout project (Phase 2 of 3) is extending phishing-resistant hardware key requirements to all IT administrators and engineering leads.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| MFA Rollout project plan and budget | PMO > Active Projects > MFA-001 | 2026-03-01 |
| Windows Authenticator MFA enrollment report | SSO Admin Console > MFA Status | 2026-03-10 |
| Authentication policy (MFA requirements) | SharePoint > Policies > InfoSec | 2026-01-15 |
| FIDO2 hardware key distribution log | IT > Asset Management > Security Keys | 2026-02-15 |
| SMS prohibition policy decision memo | Security Team > Decision Log | 2025-10-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| MFA enrollment at 85%, not 100% | 15% of users authenticate with password-only, increasing credential compromise risk | Complete Phase 2 enrollment; enforce MFA-required conditional access policy with no exceptions | Chris Magann | 2026-06-30 |
| AWS root account lacks MFA | Root account compromise would grant unrestricted access to all AWS resources | Immediately enable MFA on AWS root account using hardware security key stored in office safe | Gerry | 2026-04-15 |
| Phishing-resistant MFA limited to security team | Privileged users outside security team remain vulnerable to MFA phishing attacks | Extend FIDO2 hardware key requirement to all IT administrators and engineering leads (Phase 3) | Chris Magann | 2026-09-30 |
