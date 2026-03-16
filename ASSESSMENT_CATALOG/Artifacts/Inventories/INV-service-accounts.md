# Service Account Inventory

| Field | Value |
|-------|-------|
| **Document ID** | ALMA-INV-SVC-2026 |
| **Version** | Q1 2026 (March) |
| **Last Updated** | March 14, 2026 |
| **Maintained By** | IT Security Team |
| **Source** | CyberArk PAM + AWS IAM + Active Directory |
| **Classification** | Internal Use Only |

---

## Overview

This inventory documents all service accounts used by Alma Security automated systems, applications, and integrations. Service accounts are non-interactive accounts that authenticate on behalf of applications or services rather than individual users.

**Total service accounts:** 34
**Managed in CyberArk:** 30
**Pending CyberArk onboarding:** 2 (discovered in Q4 2025 access review)
**Last full review:** Q4 2025 (semi-annual)
**Next review:** Q2 2026

---

## AWS IAM Service Accounts (Roles and Users)

| Account Name | System / Service | Owner | Purpose | Privilege Level | Last Credential Rotation | MFA | CyberArk Managed |
|-------------|-----------------|-------|---------|-----------------|-------------------------|-----|-------------------|
| svc-auth-engine | Authentication platform | T. Wang | Core auth service access to RDS, S3, KMS | High (crown jewel) | March 1, 2026 | N/A (IAM role) | Yes |
| svc-bio-processor | Biometric processing | T. Wang | Biometric data processing and encryption | High (crown jewel) | March 1, 2026 | N/A (IAM role) | Yes |
| svc-backup-operator | Backup infrastructure | T. Wang | RDS snapshot creation, S3 replication | Medium | February 15, 2026 | N/A (IAM role) | Yes |
| svc-backup-restore | Restore operations | T. Wang | RDS restore, S3 object retrieval | Medium | February 15, 2026 | N/A (IAM role) | Yes |
| svc-cicd-deploy | GitLab CI/CD | C. Magann | Kubernetes deployment, ECR push | High | January 20, 2026 | N/A (IAM role) | Yes |
| svc-monitoring | Datadog integration | T. Wang | CloudWatch read, EC2 describe | Low (read-only) | March 1, 2026 | N/A (IAM role) | Yes |
| svc-config-audit | AWS Config | C. Magann | Config rule evaluation, compliance reporting | Low (read-only) | February 1, 2026 | N/A (IAM role) | Yes |
| svc-guardduty | GuardDuty automation | N. Khan | GuardDuty finding retrieval, auto-remediation | Medium | February 1, 2026 | N/A (IAM role) | Yes |
| svc-patch-manager | Systems Manager | C. Magann | Patch baseline application, compliance scan | Medium | January 15, 2026 | N/A (IAM role) | Yes |
| svc-velero-backup | Velero | T. Wang | S3 backup writes, EBS snapshot creation | Medium | February 15, 2026 | N/A (IAM role) | Yes |
| svc-sentinelone-api | SentinelOne integration | N. Khan | API integration for alert forwarding | Low | December 15, 2025 | N/A (API key) | Yes |
| svc-ecr-scanner | ECR image scanning | C. Magann | Container image scan initiation and retrieval | Low (read-only) | January 20, 2026 | N/A (IAM role) | Yes |

---

## Active Directory Service Accounts

| Account Name | System / Service | Owner | Purpose | Privilege Level | Last Password Rotation | CyberArk Managed |
|-------------|-----------------|-------|---------|-----------------|----------------------|-------------------|
| svc-dc-backup | Windows DC backup | T. Wang | Windows Server Backup agent | Medium | February 1, 2026 | Yes |
| svc-ad-sync | Okta AD agent | IT Security | Active Directory to Okta synchronization | Medium | January 15, 2026 | Yes |
| svc-wsus-update | WSUS | C. Magann | Windows update distribution | Low | February 1, 2026 | Yes |
| svc-fileserver-scan | Legacy file server | C. Magann | Antivirus scanning on 2012 R2 server | Low | February 1, 2026 | Yes |
| svc-print-mgmt | Print services | IT | Print server management | Low | December 1, 2025 | Yes |

---

## Application Service Accounts

| Account Name | System / Service | Owner | Purpose | Privilege Level | Last Credential Rotation | CyberArk Managed |
|-------------|-----------------|-------|---------|-----------------|-------------------------|-------------------|
| svc-jira-automation | Jira | Engineering Mgr | Automated ticket creation from vuln scans | Low | January 10, 2026 | Yes |
| svc-servicenow-api | ServiceNow | IT Security | Access request workflow automation | Medium | February 1, 2026 | Yes |
| svc-slack-bot | Slack | N. Khan | Security alert posting to #soc-alerts | Low | January 15, 2026 | Yes |
| svc-workday-api | Workday | HR | Training completion data extraction | Low (read-only) | March 1, 2026 | Yes |
| svc-pagerduty | PagerDuty | T. Wang | On-call alerting integration | Low | February 1, 2026 | Yes |
| svc-datadog-agent | Datadog | T. Wang | Metrics and log ingestion | Low | February 15, 2026 | Yes |
| svc-gitlab-runner | GitLab | C. Magann | CI/CD pipeline execution | Medium | January 20, 2026 | Yes |
| svc-salesforce-sync | Salesforce | Sales Ops | Customer data sync (outbound only) | Medium | December 15, 2025 | Yes |
| svc-hubspot-api | HubSpot | Marketing | Marketing automation sync | Low | December 15, 2025 | Yes |

---

## Database Service Accounts

| Account Name | System / Service | Owner | Purpose | Privilege Level | Last Password Rotation | CyberArk Managed |
|-------------|-----------------|-------|---------|-----------------|----------------------|-------------------|
| svc-app-rds-rw | PostgreSQL (RDS) | T. Wang | Application read/write to production database | High (crown jewel) | March 1, 2026 | Yes |
| svc-app-rds-ro | PostgreSQL (RDS) | T. Wang | Application read-only replica queries | Medium | March 1, 2026 | Yes |
| svc-analytics-rds | PostgreSQL (RDS) | Engineering Mgr | Analytics queries (read-only, non-prod replica) | Low (read-only) | February 1, 2026 | Yes |
| svc-redis-app | Redis (ElastiCache) | T. Wang | Application cache access | Medium | February 15, 2026 | Yes |

---

## Recently Discovered (Pending CyberArk Onboarding)

These accounts were discovered during the Q4 2025 access recertification and are pending onboarding to CyberArk:

| Account Name | System / Service | Owner (Assigned) | Purpose | Privilege Level | Discovery Date | CyberArk Onboarding Target |
|-------------|-----------------|-----------------|---------|-----------------|---------------|---------------------------|
| svc-legacy-etl | Legacy ETL pipeline | C. Magann | Data migration from legacy system | Medium | October 2025 | March 2026 |
| svc-test-automation | QA test framework | Engineering Mgr | Automated test execution in staging | Low | October 2025 | March 2026 |

---

## Credential Rotation Schedule

| Account Type | Rotation Frequency | Method | Last Compliance Check |
|-------------|-------------------|--------|-----------------------|
| AWS IAM roles | Automatic (session credentials) | STS assume-role | N/A (automatic) |
| AWS IAM access keys | 90 days | CyberArk automated rotation | March 1, 2026 |
| Active Directory service accounts | 90 days | CyberArk automated rotation | February 1, 2026 |
| Application API keys | 90 days | CyberArk automated rotation | March 1, 2026 |
| Database passwords | 90 days | CyberArk automated rotation | March 1, 2026 |

---

## Compliance Status

| Metric | Target | Current |
|--------|--------|---------|
| Accounts in CyberArk | 100% | 94% (32/34) |
| Accounts with assigned owner | 100% | 100% |
| Credentials rotated within policy | 100% | 97% (1 account 5 days overdue) |
| Accounts with documented purpose | 100% | 100% |
| Unused accounts (no activity 90 days) | 0 | 0 |

---

*This is a fictional example created for educational purposes.*
