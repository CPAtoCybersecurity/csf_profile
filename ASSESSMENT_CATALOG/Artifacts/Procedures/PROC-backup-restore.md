# Backup and Restore Procedure

| Field | Value |
|-------|-------|
| **Procedure ID** | ALMA-SOP-2025-011 |
| **Version** | 1.2 |
| **Effective Date** | March 1, 2025 |
| **Last Reviewed** | February 16, 2026 |
| **Procedure Owner** | Tigan Wang, IT Infrastructure |
| **Approved By** | CISO |
| **Classification** | Internal Use Only |

---

## 1. Purpose

This procedure defines the backup schedule, encryption requirements, restore testing process, and off-site storage configuration for Alma Security critical systems. It ensures data can be recovered within defined RTO and RPO targets following data loss, corruption, or disaster events.

---

## 2. Recovery Objectives

| System | RPO (Target) | RTO (Target) | Status |
|--------|-------------|-------------|--------|
| PostgreSQL (auth platform) | 5 minutes | 1 hour | Informal; pending business stakeholder approval |
| S3 (customer data) | 1 hour | 4 hours | Informal; pending approval |
| Kubernetes workloads | 24 hours | 4 hours | Informal; pending approval |
| On-premises Windows DC | 24 hours | 8 hours | Informal; pending approval |

**Note:** RTO and RPO targets are defined informally as of Q1 2026. Formal approval by business stakeholders is planned through the Cloud Security Optimization project.

---

## 3. Backup Schedule

### 3.1 AWS RDS PostgreSQL

| Parameter | Configuration |
|-----------|--------------|
| Backup type | Automated daily snapshots + continuous transaction log archiving |
| Retention | 35 days |
| Encryption | AES-256 via KMS customer-managed key |
| Cross-region replication | Enabled (us-west-2 to us-east-1) |
| Point-in-time recovery | Available to any second within 35-day window |
| Monitoring | RDS event notifications via SNS |

### 3.2 AWS S3

| Parameter | Configuration |
|-----------|--------------|
| Backup type | S3 versioning + cross-region replication |
| Retention | Version retention per lifecycle policy (90 days for non-current versions) |
| Encryption | SSE-KMS (customer-managed keys) for critical buckets; SSE-S3 for remainder (migration in progress) |
| Cross-region replication | Enabled for critical data buckets (us-west-2 to us-east-1) |
| WORM protection | S3 Object Lock deployment in progress via S3 Bucket Security project |
| Monitoring | S3 replication metrics via CloudWatch |

### 3.3 Kubernetes Persistent Volumes

| Parameter | Configuration |
|-----------|--------------|
| Backup tool | Velero |
| Schedule | Nightly at 02:00 UTC |
| Retention | 30 days |
| Encryption | Backup stored in S3 with SSE-KMS |
| Scope | All production namespaces; some non-production namespaces with persistent data have coverage gaps |
| Monitoring | Velero backup completion status (currently manual log review) |

### 3.4 On-Premises Windows Domain Controller

| Parameter | Configuration |
|-----------|--------------|
| Backup tool | Windows Server Backup |
| Schedule | Daily at 01:00 PT |
| Retention | 30 days on-site |
| Encryption | Windows Server Backup encryption enabled |
| Off-site replication | Manual scheduled transfer to AWS S3 (weekly) |
| Monitoring | Manual log review |

---

## 4. Backup Encryption

All backups must be encrypted regardless of storage location:

| Platform | Encryption Method | Key Management |
|----------|------------------|----------------|
| RDS snapshots | KMS CMK | Automatic; key rotated per Encryption Standards Policy |
| S3 backup objects | SSE-KMS | KMS CMK with key rotation |
| Velero backups | SSE-KMS (S3 storage) | KMS CMK |
| Windows backups | Windows Server Backup encryption | AD-managed recovery key |

---

## 5. Access Controls

Backup operations follow duty separation to provide ransomware resilience:

| Operation | Permitted Roles |
|-----------|----------------|
| Create backups | Backup operator IAM role |
| Restore from backups | Backup restore IAM role (separate from create) |
| Delete backups | Restricted to IT Infrastructure Manager; requires CISO approval for manual deletion |
| Modify backup configuration | IT Infrastructure team with change ticket |
| Access backup encryption keys | KMS key policy restricts to backup IAM roles |

---

## 6. Quarterly Restore Testing

### 6.1 Test Schedule

Restore tests are conducted quarterly, aligned with the access certification schedule:

| Quarter | Test Window | Systems Tested |
|---------|-------------|----------------|
| Q1 | March 15-31 | PostgreSQL + one additional system |
| Q2 | June 15-30 | Kubernetes PV + one additional system |
| Q3 | September 15-30 | S3 data + one additional system |
| Q4 | December 15-31 | PostgreSQL + one additional system |

### 6.2 Test Procedure

1. **Preparation (IT Infrastructure, Day -3)**
   - Select test target system and backup point
   - Provision isolated restore environment (separate VPC or namespace)
   - Notify stakeholders of test window

2. **Restore Execution (IT Infrastructure, Test Day)**
   - Initiate restore from selected backup to isolated environment
   - Record time-to-recovery from restore initiation to data availability
   - Document any errors or issues during restore

3. **Data Integrity Validation (IT Infrastructure + Application Owner, Test Day)**
   - Compare record counts against production baseline
   - Validate sample records for data accuracy
   - Verify application connectivity to restored data
   - Run application smoke tests against restored environment

4. **Documentation (IT Infrastructure, Test Day + 1)**
   - Complete restore test report documenting:
     - Systems tested and backup point used
     - Time-to-recovery achieved vs. RTO target
     - Data integrity validation results
     - Issues encountered and resolution
   - Submit report to CISO
   - File report in assessment evidence repository

5. **Cleanup (IT Infrastructure, Test Day + 2)**
   - Tear down isolated restore environment
   - Delete restored data copies

### 6.3 Most Recent Test Results

**Q4 2025 (December 2025):**
- PostgreSQL restore: completed in 45 minutes (target: 60 minutes)
- Data integrity: verified, all record counts matched, sample records accurate
- Issues: none

**Q1 2026:** Scheduled for March 15-31, 2026 (not yet conducted as of this review).

---

## 7. Off-Site Storage

| Data | Primary Location | Off-Site Location | Replication Method |
|------|-----------------|-------------------|-------------------|
| RDS snapshots | us-west-2 | us-east-1 | Automated cross-region snapshot copy |
| S3 critical data | us-west-2 | us-east-1 | S3 cross-region replication |
| Velero backups | us-west-2 S3 | us-east-1 (planned) | Not yet configured |
| Windows DC backups | On-premises | us-west-2 S3 | Manual weekly transfer |

**Gap:** Cross-region restore has not been tested. Planned for inclusion in quarterly testing program.

---

## 8. Alerting

| Event | Alert Mechanism | Current Status |
|-------|----------------|----------------|
| RDS backup failure | SNS notification to Slack | Active |
| S3 replication lag | CloudWatch alarm | Active |
| Velero backup failure | Manual log review | Gap: no automated alerting |
| Windows backup failure | Manual log review | Gap: no automated alerting |

**Recommendation:** Implement automated alerting for Velero and Windows backup failures via CloudWatch and SNS integration.

---

## Related Documents

| Document | Reference |
|----------|-----------|
| Information Security Policy | ALMA-POL-2025-001 |
| Encryption Standards Policy | ALMA-POL-2025-005 |
| Disaster Recovery Plan | In development (Cloud Security Optimization project) |
| Quarterly Restore Test Report | RPT-backup-restore-test |

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | March 1, 2025 | T. Wang | Initial procedure |
| 1.1 | August 1, 2025 | T. Wang | Added Velero backup procedures; expanded testing section |
| 1.2 | February 16, 2026 | T. Wang | Updated Q4 2025 test results; added alerting gap documentation; updated Object Lock status |

---

*This is a fictional example created for educational purposes.*
