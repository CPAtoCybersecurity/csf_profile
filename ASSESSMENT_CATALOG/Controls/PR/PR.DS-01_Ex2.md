# PR.DS-01_Ex2: Assess Data Integrity Protections

**Subcategory:** PR.DS-01 -- The confidentiality, integrity, and availability of data-at-rest are protected

**NIST SP 800-53 Ref:** SI-07 (Software, Firmware, and Information Integrity), SC-28 (Protection of Information at Rest)

## Implementation Example

> Assess and validate data integrity protections, including checksums, hash verification, file integrity monitoring, and tamper detection mechanisms for stored data.

## Alma Security Implementation

Alma Security implements data integrity protections through a combination of SentinelOne file integrity monitoring and AWS-native integrity verification features. SentinelOne's FIM capability is deployed across all endpoints and servers, monitoring critical system files, configuration files, and application binaries for unauthorized modifications. FIM alerts are configured to trigger on changes to sensitive directories, with real-time notifications routed to the security operations workflow for investigation within a 4-hour SLA.

At the infrastructure level, AWS S3 provides built-in integrity verification through content-MD5 checksums and ETags for all stored objects. S3 versioning is enabled on buckets containing production data, providing both integrity verification and the ability to recover from unauthorized modifications or accidental deletions. PostgreSQL databases leverage WAL (Write-Ahead Logging) for transaction integrity, and automated integrity checks run as part of the database maintenance window.

The current gap is the absence of a formal data integrity verification program that systematically validates stored data against known-good baselines on a scheduled cadence. While reactive monitoring (SentinelOne FIM) and infrastructure-level protections (S3 checksums) are in place, proactive integrity assessments of the data itself -- particularly for biometric data stores -- are not yet formalized. The data classification schema currently in development will help define integrity requirements per data sensitivity level.

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
