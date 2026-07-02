# PR.AA-02: Identity Proofing and Credential Binding — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-13

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed HR onboarding identity verification procedures, ServiceNow provisioning workflow with identity gate, remote identity proofing (video verification) procedure, contractor onboarding documentation |
| Interview | Yes | Interviewed HR Manager on identity proofing process compliance; Gerry on credential uniqueness enforcement strategy; Chris Magann on shared SSH key remediation timeline |
| Test | Yes | Sampled 8 onboarding records from Q4 2025-Q1 2026 to verify identity proofing completion before credential issuance; tested SSO credential uniqueness by querying for duplicate UPNs in AD |

---

## Findings

Alma Security performs identity proofing through the HR onboarding process, requiring government-issued photo identification before any system credentials are issued. The ServiceNow provisioning workflow includes a mandatory identity verification gate: the workflow will not progress to Active Directory account creation until HR marks the identity proofing step as "Verified" in Workday. Testing of 8 recent onboarding records confirmed that all 8 had completed identity proofing before credential issuance, including 3 remote employees who completed video verification with HR.

Credential uniqueness is enforced through the Windows Authenticator SSO platform and the Active Directory unique UPN requirement. A query of Active Directory confirmed zero duplicate User Principal Names across 350 user objects. The Information Security Policy explicitly prohibits shared accounts, and the quarterly privileged access review validates that each privileged account maps to a single identified individual.

The shared developer SSH key on port 45001 is the primary exception to credential binding controls. This key is shared among approximately 8 developers, breaking the one-to-one identity-to-credential binding that is otherwise enforced across the environment. The CSV assessment data from the 2025 assessment scored this subcategory at 3 (Q1 2025), improving to 5 (Q2 2025) after SSO credential uniqueness enforcement was verified. The shared SSH key was identified for Q3 2025 remediation in the prior assessment but remains outstanding, now retargeted to Q3 2026 through the HashiCorp Vault SSH CA project.

The remote identity proofing procedure was formalized in Q4 2025 after the security team discovered that 3 remote hires in early 2025 had received credentials before completing identity verification. The new procedure requires video verification with both HR and the hiring manager present, and the ServiceNow workflow gate prevents this scenario from recurring.

### Strengths

- Identity proofing gate in ServiceNow prevents credential issuance before verification (100% compliance in sample)
- Zero duplicate UPNs in Active Directory confirming credential uniqueness for user accounts
- Remote identity proofing procedure formalized with video verification requirement
- Contractor identity proofing follows documented process with Procurement team validation
- Quarterly privileged access reviews verify individual credential binding for elevated accounts

### Gaps

- Shared developer SSH key on port 45001 breaks one-to-one identity-to-credential binding for 8 developers
- No defined identity assurance levels mapped to access sensitivity (all users receive same proofing level)
- Remote video verification is not recorded or retained for audit purposes
- Contractor credential expiration not automatically tied to contract end date in Workday

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

**Scoring rationale:** A score of 4 falls in the Some Security band — the identity proofing process executes regularly (all 8 sampled onboarding records, including 3 remote video verifications, cleared the ServiceNow gate before credential issuance, and the AD query showed zero duplicate UPNs across 350 user objects) but carries a known exception without treatment. The shared developer SSH key on port 45001 breaks one-to-one identity-to-credential binding for approximately 8 developers and has now slipped from its original Q3 2025 remediation commitment to Q3 2026. The score cannot reach Minimally Acceptable (5.0) while that exception remains open and untreated, and while remote video verifications are neither recorded nor retained, leaving the assessment period without complete evidence.

---

## Evidence Reviewed

- HR onboarding identity verification procedure documentation
- ServiceNow provisioning workflow with identity verification gate
- 8 onboarding records (Q4 2025-Q1 2026) showing identity proofing completion
- Active Directory UPN uniqueness query results
- Information Security Policy (shared accounts prohibition)
- Remote identity proofing procedure (video verification, formalized Q4 2025)
- Q1 2026 privileged access review results
- Shared SSH key risk register entry (R-SSH-001)
- Alma assessments CSV: PR.AA-02 Ex2 historical scores

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Remediate shared developer SSH key through HashiCorp Vault SSH CA deployment; restore individual credential binding | Critical | Chris Magann |
| 2 | Define tiered identity proofing assurance levels (basic, enhanced, high) aligned to NIST SP 800-63A | Medium | Gerry |
| 3 | Implement recorded video verification with automated retention in HR document management system | Medium | Gerry |
| 4 | Automate contractor account expiration tied to contract end date in Workday | High | Tigan Wang |
| 5 | Extend identity proofing requirements to MFA device replacement and credential recovery processes | Medium | Chris Magann |

## Related

- **Test Procedure:** [PR.AA-02 Test Procedures](../../3_Test_Procedures/PR/PR.AA-02.md)
- **Controls:** [PR.AA-02_Ex1](../../2_Controls/PR/PR.AA-02_Ex1.md), [PR.AA-02_Ex2](../../2_Controls/PR/PR.AA-02_Ex2.md)
