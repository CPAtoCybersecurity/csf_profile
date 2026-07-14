# ID.RA-03: Threat Identification and Recording -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>
**Observation Date:** 2026-03-14
**Testing Status:** Complete

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Inquiry | Yes | Interviewed security team and IT operations |
| Inspection | Yes | Reviewed documentation and system configurations |
| Testing | Yes | Validated controls through sampling and verification |

## Findings

### Strengths

Threat register maintained and updated quarterly. External threat actors profiled by industry relevance. Security training addresses insider threat awareness. SentinelOne provides behavioral detection capabilities.

### Gaps

No formal insider threat program. Threat hunting performed ad hoc, not on a regular cadence. Threat register does not map threat actors to specific organizational assets or vulnerabilities.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

**Scoring rationale:** The 4 keeps threat identification in Some Security (2.0–4.9) at the "regular execution, material weaknesses" anchor. A threat register is maintained and updated quarterly, external actors are profiled by industry relevance, and SentinelOne supplies behavioral detection — so the activity recurs on a defined cadence — but three material weaknesses hold it down: no formal insider threat program, threat hunting that happens only ad hoc, and a register that never maps threat actors to Alma's specific assets or vulnerabilities. Crossing into Minimally Acceptable (5.0) requires the full threat-identification scope — external, insider, and hunt-driven — to operate consistently, with the register connected to the environment it is supposed to describe.

## Evidence Reviewed

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Establish formal insider threat program | High | Security |
| 2 | Implement regular threat hunting cadence (monthly minimum) | Medium | Security |
| 3 | Map threat actors to specific organizational assets and vulnerabilities | Medium | Security |
| 4 | Expand behavioral detection rules for internal threat indicators | Low | Security |

## Related

- **Test Procedure:** [ID.RA-03 Test Procedures](../../3_Test_Procedures/ID/ID.RA-03.md)
- **Controls:** [ID.RA-03_Ex1](../../2_Controls/ID/ID.RA-03_Ex1.md), [ID.RA-03_Ex2](../../2_Controls/ID/ID.RA-03_Ex2.md), [ID.RA-03_Ex3](../../2_Controls/ID/ID.RA-03_Ex3.md)
