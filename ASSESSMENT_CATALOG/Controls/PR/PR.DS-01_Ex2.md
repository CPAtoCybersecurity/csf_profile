# PR.DS-01_Ex2: Assess Data Integrity Protections

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SI-07 (Software, Firmware, and Information Integrity), SC-28 (Protection of Information at Rest)

## Implementation Example

> Assess and validate data integrity protections, including checksums, hash verification, file integrity monitoring, and tamper detection mechanisms for stored data.

## Alma Security Implementation

Alma implements data integrity protections through SentinelOne file integrity monitoring (FIM) on all endpoints and servers, with alerts triaged within a 4-hour SLA. AWS S3 provides content-MD5 checksums and versioning for production buckets, and PostgreSQL uses WAL for transaction integrity. Proactive integrity validation against known-good baselines is not yet formalized and is pending completion of the data classification schema.

## Artifacts

- [Data Classification Policy](../../Artifacts/Policies/POL-data-classification.md)
- [SentinelOne App Control Evidence](../../Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Encryption Standards Policy](../../Artifacts/Policies/POL-encryption-standards.md)
