# ID.IM-01: Evaluation-Based Improvement -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-17
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

NIST CSF self-assessment initiated. AWS Config provides continuous compliance monitoring for infrastructure. Assessment findings documented with remediation plans.

### Gaps

No third-party independent security audit performed. Automated compliance monitoring limited to AWS infrastructure controls. Self-assessment methodology not yet mature. No formal cadence for recurring assessments beyond annual.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** A 3 places evaluation-based improvement in Some Security (2.0–4.9). The building blocks exist — a NIST CSF self-assessment has been initiated, AWS Config supplies continuous compliance monitoring for infrastructure, and findings are documented with remediation plans — but the evaluation process itself is not yet dependable: the self-assessment methodology is immature, automated monitoring stops at AWS infrastructure controls, no independent third-party audit has been performed, and nothing recurs on a cadence tighter than annual. Minimally Acceptable (5.0) is separated from this score by a repeatable, full-scope evaluation cycle actually executing through the period — not a first-pass self-assessment still finding its method.

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Schedule and conduct third-party independent security audit | High | Security |
| 2 | Expand automated compliance monitoring beyond AWS infrastructure | Medium | Security |
| 3 | Formalize recurring assessment cadence (semi-annual minimum) | Medium | Security |
| 4 | Mature self-assessment methodology with documented procedures | Low | Security |

## Related

- **Test Procedure:** [ID.IM-01 Test Procedures](../../3_Test_Procedures/ID/ID.IM-01.md)
- **Controls:** [ID.IM-01_Ex1](../../2_Controls/ID/ID.IM-01_Ex1.md), [ID.IM-01_Ex2](../../2_Controls/ID/ID.IM-01_Ex2.md), [ID.IM-01_Ex3](../../2_Controls/ID/ID.IM-01_Ex3.md)
