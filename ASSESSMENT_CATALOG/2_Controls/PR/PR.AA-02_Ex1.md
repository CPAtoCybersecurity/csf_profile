# PR.AA-02 Ex1: Identity Proofing Before Credential Issuance

**Subcategory:** PR.AA-02 — Identities are proofed and bound to credentials based on the context of interactions

**NIST SP 800-53 Ref:** IA-12, IA-1, IA-5

## Implementation Example

> Performing identity proofing to verify an individual's claimed identity before issuing credentials, using methods appropriate to the assurance level required by the context of the interaction

## Alma Security Implementation

Alma Security requires identity proofing before any credential issuance, gated through a Workday verification step that must complete before the ServiceNow provisioning workflow activates. On-site employees present government-issued photo ID validated by HR against offer letter and background check results. Remote employees complete video verification with HR and the hiring manager, presenting government-issued ID on camera. Contractors undergo identity verification through the Procurement team before sponsor-submitted ServiceNow access requests, receiving time-bound credentials aligned to contract end dates with SSO access restricted to explicitly authorized applications.

## Artifacts

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Access Management Policy](../../5_Artifacts/Policies/POL-access-management.md)
- [Third-Party Risk Policy](../../5_Artifacts/Policies/POL-third-party-risk.md)
