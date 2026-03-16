# DE.AE-03 Ex2: Event Correlation Technology

**Subcategory:** DE.AE-03 — Information is correlated from multiple sources

**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, IR-05, IR-08, PM-16, SI-04

## Implementation Example

> Use event correlation technology (e.g., SIEM) to collect information captured by multiple sources and correlate events to identify patterns

## Alma Security Implementation

GuardDuty correlates findings across CloudTrail, VPC Flow Logs, and DNS logs to identify multi-stage attack patterns within AWS infrastructure. O365 ATP correlates email threat signals with user behavior anomalies within the Microsoft ecosystem. Cross-source correlation between AWS, endpoint (SentinelOne), and email (O365) platforms is currently manual; Nadia Khan's team is developing custom correlation scripts funded by the $150K Incident Response Enhancement project to automate cross-platform event linking.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
- [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
