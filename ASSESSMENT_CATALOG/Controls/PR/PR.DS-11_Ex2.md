# PR.DS-11_Ex2: Protect Backup Confidentiality and Integrity

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup)

## Implementation Example

> Protect the confidentiality and integrity of backup data through encryption, access controls, integrity verification, and immutable storage to prevent unauthorized access, tampering, or ransomware encryption of backups.

## Alma Security Implementation

Alma Security protects backup confidentiality through encryption at rest for all backup data. AWS RDS automated backups are encrypted using the same KMS customer-managed key as the source database, ensuring backup data receives equivalent cryptographic protection. S3 buckets storing backup data (including Velero backup archives) are configured with SSE-KMS encryption, and bucket policies enforce the aws:SecureTransport condition to require encryption in transit for all backup operations. On-premises Windows Domain Controller backups are encrypted using Windows Server Backup's built-in encryption with a managed certificate.

Backup integrity is protected through multiple mechanisms. AWS RDS backup integrity is maintained by the managed service with automated consistency checks during the backup process. Velero backup archives include checksums that are verified during restoration. S3 object integrity is verified through content-MD5 checksums at upload time. For critical compliance data, S3 Object Lock is being deployed (as part of the S3 Bucket Security project) to provide WORM protection, preventing backup deletion or modification even by administrators, which provides ransomware resilience for backup data.

Access controls on backup storage follow the principle of least privilege. IAM policies restrict backup operations (create, read, delete) to separate roles, ensuring that the ability to create backups is separated from the ability to delete them. Backup bucket policies deny all cross-account access and require MFA for delete operations on versioned objects. Backup access events are logged through CloudTrail and S3 access logs, providing an audit trail for any backup data access. The security team reviews backup access logs monthly as part of the data protection monitoring program.

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
