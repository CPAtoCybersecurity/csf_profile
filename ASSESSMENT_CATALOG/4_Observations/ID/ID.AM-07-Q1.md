# ID.AM-07: Data Inventory and Classification -- Q1 2026 Observation

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

Data classification policy defines four tiers with handling requirements. Pilot data discovery scan completed against primary databases and S3. PII data types identified and cataloged.

### Gaps

Data classification not formalized beyond pilot scope. Metadata tagging inconsistently applied. No continuous data discovery process; scans are ad hoc. Two S3 buckets found with unclassified customer data.

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** The 3 falls in Some Security (2.0–4.9): a four-tier classification policy with handling requirements exists and a pilot discovery scan covered the primary databases and S3, but execution beyond the pilot is unreliable — scans are ad hoc rather than continuous, metadata tagging is inconsistently applied, and fieldwork surfaced two S3 buckets holding unclassified customer data. That live deviation in the sampled environment, on top of the pilot-only scope, is exactly what the anchor for 3 describes. Minimally Acceptable (5.0) would require classification and discovery to run consistently across all data stores for the period, with the unclassified-bucket condition remediated or at minimum tracked as a treated exception.

## Evidence Reviewed

- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Formalize data classification program beyond pilot scope | High | Security |
| 2 | Remediate two S3 buckets with unclassified customer data | Critical | Cloud Platform |
| 3 | Implement continuous data discovery process | Medium | Security |
| 4 | Standardize metadata tagging across all classified data stores | Medium | Data Governance |

## Related

- **Test Procedure:** [ID.AM-07 Test Procedures](../../3_Test_Procedures/ID/ID.AM-07.md)
- **Controls:** [ID.AM-07_Ex1](../../2_Controls/ID/ID.AM-07_Ex1.md), [ID.AM-07_Ex2](../../2_Controls/ID/ID.AM-07_Ex2.md), [ID.AM-07_Ex3](../../2_Controls/ID/ID.AM-07_Ex3.md), [ID.AM-07_Ex4](../../2_Controls/ID/ID.AM-07_Ex4.md)
