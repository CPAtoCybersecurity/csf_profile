# PR.DS-11: Backup Management Test Procedures

**CSF Subcategory:** PR.DS-11 - Backups of data are created, protected, maintained, and tested sufficient to support recovery

---

## Test Procedures

1. **Review backup policy and procedures**
   - Obtain the organization's backup and recovery policy documentation
   - Verify policy defines backup frequency, retention periods, and scope for each data classification
   - Confirm policy addresses backup types (full, incremental, differential) and schedules
   - Validate that policy covers both cloud (AWS) and on-premises environments
   - Check that backup requirements align with business continuity and disaster recovery objectives
   - Check alignment with NIST SP 800-53 CP-09, CP-10

2. **Assess backup execution and completeness**
   - Review automated backup configurations for PostgreSQL databases
   - Verify AWS RDS automated backup settings (retention window, backup window, multi-AZ)
   - Confirm S3 versioning and cross-region replication for critical data buckets
   - Validate Kubernetes persistent volume backup procedures (Velero or equivalent)
   - Check on-premises Windows Domain Controller backup (Active Directory, system state)
   - Verify backup job completion reports for the past 30 days
   - Identify any backup failures and confirm remediation actions

3. **Evaluate backup confidentiality and integrity protection**
   - Verify backup data is encrypted at rest (AES-256 or equivalent)
   - Confirm backup encryption keys are managed separately from production keys
   - Test access controls on backup storage locations (S3 bucket policies, IAM roles)
   - Validate that backup integrity checksums are generated and verified
   - Confirm immutable backup copies exist (S3 Object Lock, WORM storage)
   - Verify that backup access is logged and monitored

4. **Test backup restoration procedures**
   - Review restoration test documentation and schedule (quarterly cadence)
   - Verify most recent restoration test results and success criteria
   - Confirm restoration testing covers critical systems (PostgreSQL databases, application data)
   - Validate that Recovery Time Objective (RTO) and Recovery Point Objective (RPO) are documented
   - Test or observe a sample restoration to verify data integrity post-restore
   - Measure actual restoration time against documented RTO targets

5. **Verify off-site and geographic backup distribution**
   - Confirm backups are stored in geographically separate location from production
   - Verify AWS cross-region backup replication configuration
   - Validate that off-site backup locations meet same security standards as production
   - Confirm network connectivity and access procedures for off-site backup retrieval
   - Review DR plan (in development via Cloud Security Optimization project) for backup integration

---

## Evidence Requests

- [ ] Backup and Recovery Policy document
- [ ] Backup schedule and configuration for all critical systems
- [ ] AWS RDS automated backup configuration screenshots
- [ ] S3 versioning and replication configuration
- [ ] Kubernetes persistent volume backup configuration (Velero or equivalent)
- [ ] Backup job completion reports (last 30 days)
- [ ] Backup encryption configuration evidence
- [ ] Backup access control documentation (IAM policies, bucket policies)
- [ ] Most recent quarterly restoration test report
- [ ] RTO and RPO documentation for critical systems
- [ ] Off-site/cross-region backup configuration evidence
- [ ] DR plan documentation (current draft if in development)

---

## Notes

This test procedure validates Alma Security's backup management practices across its hybrid infrastructure. Automated backup verification is a strength, and quarterly restore testing demonstrates proactive validation of recovery capabilities. The DR plan currently in development via the Cloud Security Optimization project ($100K) will formalize recovery objectives and procedures. Assessors should evaluate whether current backup practices adequately protect biometric data given its highest sensitivity classification, and whether the backup encryption aligns with the in-progress Data Encryption Upgrade project standards. The transition from manual to automated restore testing is a positive maturity indicator that should be documented.
