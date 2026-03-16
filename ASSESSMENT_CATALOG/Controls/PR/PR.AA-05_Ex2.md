# PR.AA-05 Ex2: Privileged Access Management

**Subcategory:** PR.AA-05 — Access permissions, entitlements, and authorizations are defined in a policy, managed, enforced, and reviewed, and incorporate the principles of least privilege and separation of duties

**NIST SP 800-53 Ref:** AC-2(7), AC-6(1), AC-6(2), AC-6(5), AC-6(10)

## Implementation Example

> Implementing privileged access management (PAM) controls including separate privileged accounts, just-in-time access, session recording, and elevated monitoring for administrative activities

## Alma Security Implementation

Alma Security manages privileged access through Active Directory tiered administration and AWS IAM role-based elevation. On-premises privileged accounts (adm-[username]) reside in a separate OU with restrictive GPO settings preventing interactive logon to standard workstations and requiring hardware token authentication, with Domain Admin membership limited to 4 individuals and reviewed monthly. AWS production privileged access requires assuming IAM roles through SAML federation with MFA re-authentication, with CloudTrail logging all API calls and GuardDuty alerting on anomalous privileged activity patterns. Audit trails for privileged actions are provided through CloudTrail and Windows Security Event logs.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Privileged account inventory (adm- accounts) | Active Directory > Privileged OU | 2026-03-01 |
| Domain Admin membership review log | Security Team > Monthly Reviews | 2026-03-01 |
| AWS production IAM role trust policies | AWS IAM > Roles > Production Roles | 2026-02-15 |
| CloudTrail privileged activity logs | AWS CloudTrail > Production Account | 2026-03-10 |
| GuardDuty privileged access alert configuration | AWS GuardDuty > Custom Threat Lists | 2026-02-01 |
| PAM solution evaluation roadmap item | Security Tooling Roadmap > Q3 2026 | 2026-03-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No dedicated PAM solution for session recording | Cannot replay privileged sessions for forensic analysis; limited visibility into admin actions beyond API logs | Evaluate and deploy PAM solution (CyberArk, HashiCorp Boundary, or AWS SSM with session recording) | Gerry | 2026-09-30 |
| No just-in-time (JIT) privileged access | Privileged accounts are persistently enabled; elevated access is not time-bounded | Implement JIT access through PAM solution or custom workflow requiring time-limited privilege elevation | Chris Magann | 2026-09-30 |
| AWS root account lacks MFA | Root account is the most privileged identity; compromise grants full AWS control | Enable hardware MFA on root account immediately; store recovery codes in physical safe | Gerry | 2026-04-15 |
