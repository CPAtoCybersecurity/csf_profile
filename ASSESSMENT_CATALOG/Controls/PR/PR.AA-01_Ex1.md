# PR.AA-01 Ex1: Integrating Identity Management into Policies and Procedures

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-1, IA-2, IA-3, IA-4, IA-5, IA-8

## Implementation Example

> Integrating the management of identities, credentials (e.g., passwords, certificates, keys), and identity assertions (e.g., SAML tokens, Kerberos tickets) into onboarding, offboarding, role-change, and credential-recovery procedures

## Alma Security Implementation

Alma Security integrates identity and credential management into HR-driven lifecycle events through ServiceNow workflows. When HR initiates an onboarding ticket in Workday, an automated ServiceNow integration creates provisioning tasks for IT. The provisioning workflow creates the Active Directory account on the on-premises Windows Domain Controller, assigns role-based group memberships, enrolls the user in Windows Authenticator SSO, and triggers MFA enrollment. Each step requires completion before the next activates, ensuring credentials are issued only after manager approval and identity verification are documented.

For offboarding, HR termination events in Workday trigger an automated ServiceNow incident that disables the Active Directory account, revokes SSO sessions, removes AWS IAM console access, and deactivates the physical badge. The offboarding SLA requires same-day revocation for involuntary terminations and next-business-day for voluntary departures. Role changes follow a similar workflow: the existing access is reviewed, unnecessary entitlements are removed, and new role-appropriate access is provisioned through the standard approval chain.

Credential recovery procedures require the help desk to verify identity using a challenge-response protocol before resetting passwords or re-enrolling MFA devices. Nadia Khan's Detection and Response team monitors for anomalous credential activity post-recovery to detect potential social engineering attacks targeting the reset process.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Identity Management Policy | SharePoint > Policies > InfoSec | 2026-01-15 |
| ServiceNow onboarding workflow | ServiceNow > Workflow Designer | 2026-02-01 |
| Offboarding checklist and SLA | HR Procedures > Offboarding | 2026-01-20 |
| Workday-ServiceNow integration config | ServiceNow > Integration Hub | 2026-01-10 |
| Help desk identity verification script | IT Support > Runbooks | 2025-11-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Role-change workflow not fully automated | Manual steps delay access adjustments during transfers, increasing window of excessive privilege | Implement automated role-change detection from Workday position changes | Gerry | 2026-06-30 |
| Credential recovery identity verification relies on knowledge-based questions | Susceptible to social engineering; help desk may be targeted | Migrate to video-based identity verification for high-privilege credential resets | Chris Magann | 2026-07-31 |
| Service account credentials not integrated into lifecycle workflows | Service accounts may persist after project decommission | Extend ServiceNow lifecycle workflows to include service account provisioning and deprovisioning | Tigan Wang | 2026-08-31 |
