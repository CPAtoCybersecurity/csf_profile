# PR.AA-02 Ex1: Identity Proofing Before Credential Issuance

**Subcategory:** PR.AA-02 — Identities are proofed and bound to credentials based on the context of interactions

**NIST SP 800-53 Ref:** IA-12, IA-1, IA-5

## Implementation Example

> Performing identity proofing to verify an individual's claimed identity before issuing credentials, using methods appropriate to the assurance level required by the context of the interaction

## Alma Security Implementation

Alma Security requires identity proofing before any credential issuance, gated through a Workday verification step that must complete before the ServiceNow provisioning workflow activates. On-site employees present government-issued photo ID validated by HR against offer letter and background check results. Remote employees complete video verification with HR and the hiring manager, presenting government-issued ID on camera. Contractors undergo identity verification through the Procurement team before sponsor-submitted ServiceNow access requests, receiving time-bound credentials aligned to contract end dates with SSO access restricted to explicitly authorized applications.

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
