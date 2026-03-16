# PR.DS-01_Ex2: Assess Data Integrity Protections

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SI-07 (Software, Firmware, and Information Integrity), SC-28 (Protection of Information at Rest)

## Implementation Example

> Assess and validate data integrity protections, including checksums, hash verification, file integrity monitoring, and tamper detection mechanisms for stored data.

## Alma Security Implementation

Alma implements data integrity protections through SentinelOne file integrity monitoring (FIM) on all endpoints and servers, with alerts triaged within a 4-hour SLA. AWS S3 provides content-MD5 checksums and versioning for production buckets, and PostgreSQL uses WAL for transaction integrity. Proactive integrity validation against known-good baselines is not yet formalized and is pending completion of the data classification schema.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| SentinelOne FIM policy configuration | SentinelOne Management Console | 2026-03-05 |
| FIM alert samples and investigation records | SentinelOne / Ticketing system | 2026-03-05 |
| S3 versioning configuration for production buckets | AWS S3 Console / AWS Config | 2026-03-01 |
| PostgreSQL WAL configuration and integrity settings | RDS parameter group configuration | 2026-02-20 |
| Integrity monitoring alert response SLA documentation | Security Operations Runbook | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 3 | 5 | Partial - reactive monitoring deployed, proactive integrity validation not yet formalized |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| No scheduled proactive data integrity validation | Integrity issues may go undetected until FIM triggers | Implement quarterly integrity baseline validation for critical data stores | Nadia Khan | 2026-07-31 |
| Data classification schema incomplete | Cannot fully define integrity requirements per data type | Complete data classification schema to drive integrity control mapping | Chris Magann | 2026-06-30 |
| FIM coverage gaps on some Kubernetes worker nodes | Containers without FIM may miss file modifications | Extend SentinelOne FIM to all Kubernetes worker nodes | Tigan Wang | 2026-05-31 |
