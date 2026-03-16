# PR.DS-11_Ex2: Protect Backup Confidentiality and Integrity

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup)

## Implementation Example

> Protect the confidentiality and integrity of backup data through encryption, access controls, integrity verification, and immutable storage to prevent unauthorized access, tampering, or ransomware encryption of backups.

## Alma Security Implementation

Alma protects backup confidentiality through KMS encryption on RDS backups, SSE-KMS on S3 backup buckets (with SecureTransport enforced), and Windows Server Backup encryption for on-premises DC backups. Backup integrity uses RDS automated consistency checks, Velero archive checksums, and S3 content-MD5 verification, with S3 Object Lock (WORM) being deployed for compliance data. IAM policies separate backup create/read/delete roles, bucket policies require MFA for versioned object deletion, and CloudTrail logs all backup access events.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| RDS backup encryption configuration (KMS CMK) | AWS RDS Console | 2026-03-01 |
| S3 backup bucket encryption and policy configuration | AWS S3 Console | 2026-03-10 |
| S3 Object Lock configuration for compliance buckets | AWS S3 Console | 2026-03-10 |
| Velero backup integrity verification configuration | Velero CLI / configuration | 2026-02-20 |
| IAM policies for backup operations (create vs. delete separation) | AWS IAM Console | 2026-03-01 |
| CloudTrail logs for backup access events | AWS CloudTrail | 2026-03-05 |
| Windows DC backup encryption certificate | Windows Server Backup configuration | 2026-02-15 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | Partial - encryption and access controls deployed, immutable storage rollout in progress |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| S3 Object Lock not yet applied to all backup buckets | Some backups may be vulnerable to deletion or ransomware encryption | Complete S3 Object Lock deployment across all backup buckets | Chris Magann | 2026-06-30 |
| Backup access log review is monthly, not automated | Unauthorized access may not be detected promptly | Implement automated alerting for unusual backup access patterns | Nadia Khan | 2026-06-30 |
| On-premises backup encryption key management not formalized | Key loss could render backups unrecoverable | Document on-prem backup encryption key management and escrow procedures | Chris Magann | 2026-05-31 |
