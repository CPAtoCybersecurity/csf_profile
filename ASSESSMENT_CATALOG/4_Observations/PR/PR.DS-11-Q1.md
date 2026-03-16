# PR.DS-11: Backup Management -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed AWS RDS automated backup configuration, S3 versioning and cross-region replication settings, Velero backup job schedules, Windows DC backup configuration, backup encryption settings, S3 Object Lock deployment status, and Q4 2025 quarterly restore test report. |
| Interview | Yes | Interviewed Tigan Wang on backup infrastructure and DR plan development status, Chris Magann on backup encryption and S3 Object Lock rollout, and reviewed Cloud Security Optimization project scope. |
| Test | Yes | Verified RDS backup completion logs for last 30 days (no failures), confirmed S3 cross-region replication status on critical buckets, validated Velero backup job completion records, and reviewed Q4 2025 restore test results including time-to-recovery measurements. |

---

## Findings

### Strengths

- Automated daily backups operational for all critical systems: RDS PostgreSQL (35-day retention with continuous archiving), S3 (versioning enabled), Kubernetes persistent volumes (Velero nightly, 30-day retention), and on-premises Windows DC
- RDS continuous transaction log archiving enables point-in-time recovery to any second within the 35-day retention window, supporting an RPO of 5 minutes for the continuous authentication platform
- Quarterly restore testing program is established with documented test plans and formal test reports; Q4 2025 test successfully restored PostgreSQL database within 45 minutes
- Backup encryption is enforced across all platforms: RDS uses KMS CMK, S3 backup buckets use SSE-KMS, on-premises backups use Windows Server Backup encryption
- Cross-region backup replication is configured for RDS snapshots and critical S3 data
- IAM policies separate backup create and backup delete permissions, providing ransomware resilience through duty separation
- GitOps repository provides version-controlled infrastructure-as-code serving as configuration backup and recovery mechanism

### Gaps

- No full-environment DR recovery test has been conducted; quarterly tests cover individual system restoration only
- RTO and RPO targets are defined informally and have not been formally approved by business stakeholders
- Q1 2026 quarterly restore test has not yet been conducted (due by end of March)
- S3 Object Lock (WORM protection) is not yet deployed to all backup buckets; rollout in progress via S3 Bucket Security project
- Velero backup scope does not cover all Kubernetes namespaces; some non-production workloads with persistent data lack backup coverage
- No automated alerting for backup job failures; current monitoring relies on manual log review
- On-premises backup replication to AWS relies on a manual scheduled transfer process without failure alerting
- DR plan is still in development through the Cloud Security Optimization project ($100K); formal recovery procedures not yet documented
- Cross-region backup restoration has not been tested

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 7 |

---

## Evidence Reviewed

- AWS RDS automated backup configuration (35-day retention, continuous archiving enabled)
- RDS backup completion logs for March 1-14, 2026 (zero failures)
- S3 versioning configuration for production and backup buckets
- S3 cross-region replication configuration for critical data buckets
- Velero backup CronJob schedule and completion reports (last 30 days)
- Windows DC backup schedule and completion reports
- Q4 2025 quarterly restore test report (PostgreSQL restored in 45 minutes, data integrity verified)
- Backup encryption configuration across RDS, S3, and on-premises
- IAM policies showing backup operation duty separation
- S3 Object Lock deployment tracker (S3 Bucket Security project)
- Cloud Security Optimization project DR plan development status
- Data criticality matrix defining backup frequency and retention

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Execute Q1 2026 quarterly restore test before end of March to maintain testing cadence | High | Tigan Wang |
| 2 | Formalize RTO and RPO targets with business stakeholder approval through DR plan | High | Tigan Wang |
| 3 | Implement automated alerting for backup job failures across all platforms with escalation SLA | High | Tigan Wang |
| 4 | Complete S3 Object Lock deployment to all backup buckets for ransomware resilience | Medium | Chris Magann |
| 5 | Expand Velero backup scope to include all Kubernetes namespaces with persistent data | Medium | Tigan Wang |
| 6 | Automate on-premises backup replication to AWS with failure alerting | Medium | Tigan Wang |
| 7 | Plan and execute full-environment DR recovery test once DR plan is completed | Medium | Tigan Wang |
| 8 | Include cross-region restore test in quarterly testing program | Low | Tigan Wang |
