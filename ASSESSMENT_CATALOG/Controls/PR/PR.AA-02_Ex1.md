# PR.AA-02 Ex1: Identity Proofing Before Credential Issuance

**Subcategory:** PR.AA-02 — Identities are proofed and bound to credentials based on the context of interactions

**NIST SP 800-53 Ref:** IA-12, IA-1, IA-5

## Implementation Example

> Performing identity proofing to verify an individual's claimed identity before issuing credentials, using methods appropriate to the assurance level required by the context of the interaction

## Alma Security Implementation

Alma Security performs identity proofing as part of the HR onboarding process before any system credentials are issued. New employees are required to present government-issued photo identification (driver's license or passport) during their first day at the Redwood City office. HR validates the identification against the offer letter and background check results conducted by the third-party screening provider. Only after HR marks the identity verification step as complete in Workday does the ServiceNow provisioning workflow activate, creating the Active Directory account and initiating Windows Authenticator SSO enrollment.

For remote employees who cannot appear in person on day one, Alma uses a video verification call conducted by HR with the hiring manager present. The remote employee must display their government-issued ID on camera, and HR captures a screenshot for the personnel file. This process was formalized in Q4 2025 after the security team identified that three remote hires in 2025 had received credentials before completing identity verification, a finding that prompted the workflow gate in ServiceNow.

Contractor identity proofing follows a similar but separate path. The contracting company provides identification documentation, which is verified by the Procurement team before the contractor's sponsor (typically an engineering manager) submits the access request in ServiceNow. Contractor accounts are provisioned with time-bound credentials aligned to the contract end date, and the SSO configuration restricts contractor access to explicitly authorized applications only.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| HR onboarding identity verification procedure | HR Procedures > Onboarding | 2026-01-15 |
| ServiceNow provisioning workflow with identity gate | ServiceNow > Workflow Designer | 2026-02-01 |
| Remote identity proofing procedure (video verification) | HR Procedures > Remote Onboarding | 2025-12-01 |
| Contractor identity verification procedure | Procurement > Contractor Onboarding | 2025-11-15 |
| Background check provider contract and SLA | Legal > Vendor Contracts | 2025-10-01 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 5 | Below Target |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Remote video verification lacks standardized recording and retention | Cannot audit or re-verify remote identity proofing completion after the fact | Implement recorded video verification with automated retention in HR document management | Gerry | 2026-06-30 |
| No defined identity assurance levels mapped to access contexts | All users receive same proofing level regardless of access sensitivity | Define tiered proofing levels (basic, enhanced, high) aligned to NIST SP 800-63A; require enhanced proofing for privileged access | Chris Magann | 2026-07-31 |
