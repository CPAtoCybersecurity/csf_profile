---
id: 'PR.AA-02'
function_id: 'PR'
function_name: 'PROTECT'
category_id: 'PR.AA'
category_name: 'Identity Management, Authentication, and Access Control'
in_scope: 'Yes'
owner: 'gerry <gerry@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'IA-12'
score: 5
target_score: 5
minimum_target: 5
remediation_owner:
remediation_due:
artifact_name:
---

# PR.AA-02 — Identities are proofed and bound to credentials based on the context of interactions

## Description

Identities are proofed and bound to credentials based on the context of interactions

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 3 | 5 | Complete | Yes | Yes | No | 15-Feb |
| Q2 | 5 | 5 | Complete | No | Yes | Yes | 11-May |
| Q3 | 5 | 5 | Not Started | No | No | No | — |
| Q4 | 5 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Individual credentials issued to all personnel. No shared accounts policy enforced. MFA rollout project initiated ($80K) supporting G8 partnership requirements.

**Q2 observations**

Credential uniqueness enforced enterprise-wide. Privileged access reviews completed quarterly. Shared developer SSH key identified for remediation in Q3.

## NIST 800-53 References

IA-12

## Test Procedures

1. Inquiry: CISO, IAM Team, 2. Inspect account inventory, 3. Inspect sample of privileged access

## Implementation Examples

- **Ex1:** Verify a person's claimed identity at enrollment time using government-issued identity credentials (e.g., passport, visa, driver's license)

  IA-12
- **Ex2:** Issue a different credential for each person (i.e., no credential sharing)

  Identity management enforces credential uniqueness through: (1) no shared accounts policy in Information Security Policy, (2) individual credentials issued via SSO, (3) quarterly privileged access reviews by IAM team. The MFA Rollout project ($80K) supports the Apple Passkey partnership (G8). Shared developer SSH key is identified for Q3 remediation.

## Remediation / Action Plan

_Add remediation owner, due date, and action plan here._
