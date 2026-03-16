# PR.DS-11_Ex4: Store Backups at Off-Site Locations

**Subcategory:** PR.DS-11 -- Backups of data are created, protected, maintained, and tested sufficient to support recovery

**NIST SP 800-53 Ref:** CP-09 (System Backup), CP-10 (System Recovery and Reconstitution)

## Implementation Example

> Store backup copies at geographically separate off-site locations to protect against site-level disasters, including natural disasters, facility failures, and regional outages, ensuring backup availability for recovery operations.

## Alma Security Implementation

Alma stores backup copies in geographically separate locations via AWS cross-region replication for RDS snapshots and S3 backup buckets (encrypted with a separate destination-region KMS key), with Velero archives benefiting from the same CRR configuration. On-premises DC backups are replicated to AWS via scheduled secure transfer, providing geographic separation from the Redwood City facility. The Cloud Security Optimization project ($100K) is formalizing the off-site strategy with cross-region failover procedures and evaluating AWS Backup for unified orchestration.

## Artifacts

- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [Encryption Standards Policy](../../5_Artifacts/Policies/POL-encryption-standards.md)
