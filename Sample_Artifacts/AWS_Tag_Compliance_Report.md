# AWS Tag Compliance Report
**Date:** 2026-02-15
**Account:** Alma Security Production (123456789012)
**Config Rule:** required-tags

## Compliance Summary
- **Total Resources Evaluated:** 847
- **Compliant:** 792 (93.5%)
- **Non-Compliant:** 55 (6.5%)

## Required Tags Checked
| Tag Key | Required | Enforced Values |
|---------|----------|-----------------|
| Environment | Yes | prod, staging, dev, test |
| Owner | Yes | (any non-empty) |
| Application | Yes | (any non-empty) |
| Name | Yes | (any non-empty) |

## Non-Compliant Resources (Sample)
| Resource Type | Resource ID | Missing Tags |
|---------------|-------------|--------------|
| EC2 Instance | i-0abc123def456 | Owner, Application |
| S3 Bucket | alma-temp-logs | Environment, Owner |
| RDS Instance | alma-analytics-db | Application |
| Lambda Function | data-processor-v2 | Owner |

## Remediation Status
- 12 resources remediated this week
- 43 resources pending owner identification
- Escalated to Cloud Platform team for resolution by 2026-03-01
