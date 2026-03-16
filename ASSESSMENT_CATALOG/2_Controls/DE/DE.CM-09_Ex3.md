# DE.CM-09 Ex3: Software Configuration Deviation Monitoring

**Subcategory:** DE.CM-09 — Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-04, AC-09, AU-12, CA-07, CM-03, CM-06, CM-10, CM-11, SC-34, SC-35, SI-04, SI-07

## Implementation Example

> Monitor software configurations for deviations from security baselines

## Alma Security Implementation

AWS Config continuously monitors resource configurations against security baselines, generating compliance findings when EC2 instances, S3 buckets, IAM policies, or security groups deviate from approved configurations. SentinelOne Application Control monitors endpoint software installations against the approved software baseline, flagging unauthorized applications. Configuration drift detection in AWS Config triggers SNS notifications to the SOC Slack channel for remediation triage.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
