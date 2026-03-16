# PR.DS-11_Ex2: Protect Backup Confidentiality and Integrity

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup)

## Implementation Example

> Protect the confidentiality and integrity of backup data through encryption, access controls, integrity verification, and immutable storage to prevent unauthorized access, tampering, or ransomware encryption of backups.

## Alma Security Implementation

Alma protects backup confidentiality through KMS encryption on RDS backups, SSE-KMS on S3 backup buckets (with SecureTransport enforced), and Windows Server Backup encryption for on-premises DC backups. Backup integrity uses RDS automated consistency checks, Velero archive checksums, and S3 content-MD5 verification, with S3 Object Lock (WORM) being deployed for compliance data. IAM policies separate backup create/read/delete roles, bucket policies require MFA for versioned object deletion, and CloudTrail logs all backup access events.

## Artifacts

- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
