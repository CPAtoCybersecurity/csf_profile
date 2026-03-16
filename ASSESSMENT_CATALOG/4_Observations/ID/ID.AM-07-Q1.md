# ID.AM-07: Data Inventory and Classification -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment
**Assessor:** Steve <steve@almasecurity.com>
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
