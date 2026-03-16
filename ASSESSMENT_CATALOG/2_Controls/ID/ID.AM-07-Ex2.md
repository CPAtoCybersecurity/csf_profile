# ID.AM-07: Data Inventory and Classification

**Subcategory:** ID.AM-07 — Inventories of data and corresponding metadata for designated data types are maintained
**NIST SP 800-53 Ref:** CM-12,CM-13,SI-12

## Implementation Example

> Ex2: Continuously discover and analyze ad hoc data to identify new instances of designated data type

## Alma Security Implementation

Alma Security has piloted data classification for PII and financial data types. Data discovery scanning has been run against primary databases and S3 buckets. A data classification policy defines four tiers: Public, Internal, Confidential, and Restricted. Metadata tagging for classified data is not yet consistently applied.

## Artifacts

- [Data Classification Policy](../../5_Artifacts/Policies/POL-data-classification.md)
- [AWS Config Compliance](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
