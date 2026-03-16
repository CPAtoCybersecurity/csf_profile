# DE.CM-06 Ex1: External Provider Activity Monitoring

**Subcategory:** DE.CM-06 — External service provider activities and services are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** CA-07, PS-07, SA-04, SA-09, SI-04

## Implementation Example

> Monitor remote and onsite administration and maintenance activities that external providers perform on organizational systems

## Alma Security Implementation

CloudTrail logs all API activity from third-party vendor IAM roles operating within Alma's AWS accounts, with GuardDuty monitoring for anomalous patterns from external principal ARNs. Vendor remote access sessions are conducted through time-limited IAM role assumptions with session logging enabled. The SOC team reviews third-party access activity in weekly log reviews, verifying that vendor actions align with approved change tickets and maintenance windows.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
