# DE.CM-06 Ex2: Cloud and Service Provider Monitoring

**Subcategory:** DE.CM-06 — External service provider activities and services are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** CA-07, PS-07, SA-04, SA-09, SI-04

## Implementation Example

> Monitor activity from cloud-based services, internet service providers, and other service providers for adverse events

## Alma Security Implementation

AWS CloudTrail and GuardDuty provide native monitoring of AWS service-level activity, including detecting compromised credentials, unusual service configurations, and policy changes across all Alma accounts. O365 ATP monitors Microsoft cloud service activity for email and collaboration platform threats. SaaS application admin consoles for productivity tools are reviewed during weekly manual log reviews for unauthorized configuration changes or suspicious administrator activity.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
