# PR.AA-01 Ex1: Integrating Identity Management into Policies and Procedures

**Subcategory:** PR.AA-01 — Identities and credentials for authorized users, services, and hardware are managed by the organization

**NIST SP 800-53 Ref:** IA-1, IA-2, IA-3, IA-4, IA-5, IA-8

## Implementation Example

> Integrating the management of identities, credentials (e.g., passwords, certificates, keys), and identity assertions (e.g., SAML tokens, Kerberos tickets) into onboarding, offboarding, role-change, and credential-recovery procedures

## Alma Security Implementation

Alma Security manages identity and credential lifecycle through Workday-to-ServiceNow integration workflows covering onboarding, offboarding, role changes, and credential recovery. Provisioning creates Active Directory accounts on the Windows Domain Controller, assigns RBAC group memberships, enrolls users in Windows Authenticator SSO, and triggers MFA enrollment, with each step gated on manager approval and identity verification. Offboarding triggers same-day account disablement, SSO session revocation, AWS IAM access removal, and badge deactivation. Credential recovery requires help desk identity verification via challenge-response protocol before password resets or MFA re-enrollment.

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
