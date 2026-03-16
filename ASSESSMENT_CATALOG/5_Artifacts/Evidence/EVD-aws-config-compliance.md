# AWS Config Compliance Snapshot

| Field | Value |
|-------|-------|
| **Document ID** | ALMA-EVD-AWSCFG-2026-Q1 |
| **Snapshot Date** | March 14, 2026 |
| **AWS Account** | Alma Security Production (123456789012) |
| **Region** | us-west-2 (primary), us-east-1 (DR) |
| **Exported By** | Chris Magann, Vulnerability Management |
| **Classification** | Internal Use Only |

---

## Overview

This document captures the AWS Config compliance posture for the Alma Security production AWS account. AWS Config continuously evaluates resource configurations against security rules. This snapshot supports the PR.PS-01 (configuration management) assessment.

---

## Compliance Summary

| Metric | Value |
|--------|-------|
| Total Config rules active | 28 |
| Total resources evaluated | 1,247 |
| Compliant resources | 1,178 (94.5%) |
| Non-compliant resources | 69 (5.5%) |
| Rules with 100% compliance | 19 |
| Rules with non-compliance | 9 |

---

## Config Rules and Compliance Status

### Identity and Access Management

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| iam-root-access-key-check | 1 | 1 | 0 | 100% |
| iam-user-mfa-enabled | 34 | 34 | 0 | 100% |
| iam-password-policy | 1 | 1 | 0 | 100% |
| iam-user-no-policies-check | 34 | 32 | 2 | 94.1% |
| access-keys-rotated (90 days) | 18 | 17 | 1 | 94.4% |

### Encryption and Data Protection

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| s3-bucket-server-side-encryption-enabled | 67 | 67 | 0 | 100% |
| s3-bucket-ssl-requests-only | 67 | 67 | 0 | 100% |
| s3-default-encryption-kms | 67 | 41 | 26 | 61.2% |
| rds-storage-encrypted | 8 | 8 | 0 | 100% |
| ebs-encrypted-volumes | 89 | 89 | 0 | 100% |
| kms-cmk-not-scheduled-for-deletion | 12 | 12 | 0 | 100% |
| elb-tls-https-listeners-only | 6 | 6 | 0 | 100% |

### Network Security

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| restricted-ssh | 47 | 47 | 0 | 100% |
| vpc-default-security-group-closed | 12 | 12 | 0 | 100% |
| vpc-flow-logs-enabled | 12 | 12 | 0 | 100% |
| ec2-security-group-attached-to-eni-periodic | 47 | 44 | 3 | 93.6% |

### Logging and Monitoring

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| cloudtrail-enabled | 1 | 1 | 0 | 100% |
| cloudtrail-log-file-validation-enabled | 1 | 1 | 0 | 100% |
| guardduty-enabled-centralized | 1 | 1 | 0 | 100% |
| rds-logging-enabled | 8 | 8 | 0 | 100% |

### Resource Tagging

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| required-tags (Environment, Owner, Application, Name) | 847 | 792 | 55 | 93.5% |

### Backup and Recovery

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| rds-automated-backups-enabled | 8 | 8 | 0 | 100% |
| s3-bucket-versioning-enabled | 67 | 65 | 2 | 97.0% |
| s3-bucket-replication-enabled | 14 | 14 | 0 | 100% |

### Configuration Hardening

| Rule | Resources Evaluated | Compliant | Non-Compliant | Compliance % |
|------|--------------------| ----------|---------------|-------------|
| ec2-instance-managed-by-systems-manager | 89 | 87 | 2 | 97.8% |
| ec2-instance-no-public-ip | 89 | 89 | 0 | 100% |
| s3-bucket-public-read-prohibited | 67 | 67 | 0 | 100% |
| s3-bucket-public-write-prohibited | 67 | 67 | 0 | 100% |

---

## Non-Compliant Resources Detail

### Critical Non-Compliance (Requiring Immediate Action)

| Rule | Resource Type | Resource ID | Issue | Owner | Remediation |
|------|-------------|-------------|-------|-------|-------------|
| access-keys-rotated | IAM User | svc-salesforce-sync | Access key age: 97 days (SLA: 90 days) | Sales Ops | Rotation scheduled March 15; CyberArk rotation job failed, investigating |

### High Priority Non-Compliance

| Rule | Resource Type | Resource ID | Issue | Owner | Remediation |
|------|-------------|-------------|-------|-------|-------------|
| s3-default-encryption-kms | S3 Bucket | (26 buckets) | Using SSE-S3 instead of SSE-KMS with customer-managed key | C. Magann | S3 Bucket Security project; migration ~60% complete |
| iam-user-no-policies-check | IAM User | svc-legacy-etl | Inline policy attached directly to user | C. Magann | Migrating to role-based access; target March 2026 |
| iam-user-no-policies-check | IAM User | svc-test-automation | Inline policy attached directly to user | Engineering | Migrating to role-based access; target March 2026 |

### Medium Priority Non-Compliance

| Rule | Resource Type | Resource ID | Issue | Owner | Remediation |
|------|-------------|-------------|-------|-------|-------------|
| ec2-security-group-attached-to-eni-periodic | Security Group | sg-0abc123 | Unused security group (no attached ENIs) | T. Wang | Cleanup scheduled for March maintenance |
| ec2-security-group-attached-to-eni-periodic | Security Group | sg-0def456 | Unused security group | T. Wang | Cleanup scheduled for March maintenance |
| ec2-security-group-attached-to-eni-periodic | Security Group | sg-0ghi789 | Unused security group | T. Wang | Cleanup scheduled for March maintenance |
| ec2-instance-managed-by-systems-manager | EC2 Instance | i-0jkl012 | SSM agent not reporting (staging instance) | T. Wang | Agent reinstallation scheduled |
| ec2-instance-managed-by-systems-manager | EC2 Instance | i-0mno345 | SSM agent not reporting (staging instance) | T. Wang | Agent reinstallation scheduled |

### Low Priority Non-Compliance

| Rule | Resource Type | Resource ID | Issue | Owner | Remediation |
|------|-------------|-------------|-------|-------|-------------|
| required-tags | Various | 55 resources | Missing one or more required tags | Cloud Platform | Ongoing remediation; 12 fixed this week, 43 pending |
| s3-bucket-versioning-enabled | S3 Bucket | alma-temp-scratch | Temporary scratch bucket, versioning not enabled | Engineering | Low priority; bucket contains no persistent data |
| s3-bucket-versioning-enabled | S3 Bucket | alma-cicd-artifacts-archive | Archive bucket; versioning disabled for cost optimization | C. Magann | Evaluate if versioning needed; risk-accepted for now |

---

## Trend (6 Months)

| Month | Total Resources | Compliant | Non-Compliant | Compliance % |
|-------|----------------|-----------|---------------|-------------|
| October 2025 | 1,189 | 1,083 | 106 | 91.1% |
| November 2025 | 1,201 | 1,108 | 93 | 92.3% |
| December 2025 | 1,215 | 1,132 | 83 | 93.2% |
| January 2026 | 1,228 | 1,148 | 80 | 93.5% |
| February 2026 | 1,239 | 1,164 | 75 | 93.9% |
| March 2026 | 1,247 | 1,178 | 69 | 94.5% |

**Trend analysis:** Steady improvement from 91.1% to 94.5% over 6 months. The largest remaining non-compliance block is the S3 SSE-KMS migration (26 buckets), which will move compliance to approximately 96.5% upon completion.

---

## Remediation Actions in Progress

| Action | Target Completion | Owner | Impact on Compliance |
|--------|-------------------|-------|---------------------|
| S3 SSE-KMS migration (remaining 26 buckets) | Q2 2026 | C. Magann | +2.1% (to ~96.6%) |
| IAM user inline policy migration (2 accounts) | March 2026 | C. Magann | +0.2% |
| Unused security group cleanup (3 groups) | March 2026 | T. Wang | +0.2% |
| SSM agent reinstallation (2 instances) | March 2026 | T. Wang | +0.2% |
| Resource tag remediation (55 resources) | Ongoing | Cloud Platform | +4.4% (toward 100% on tagging rule) |

---

## Auto-Remediation

The following Config rules have automated remediation enabled via AWS Systems Manager:

| Rule | Auto-Remediation Action |
|------|------------------------|
| s3-bucket-public-read-prohibited | Block public access applied automatically |
| s3-bucket-public-write-prohibited | Block public access applied automatically |
| s3-bucket-server-side-encryption-enabled | Default encryption enabled automatically |

All other remediations require manual action with change management approval.

---

*This is a fictional example created for educational purposes.*
