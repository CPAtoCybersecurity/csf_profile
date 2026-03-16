# DE.AE-06 Ex1: Automated Alert Distribution to SOC

**Subcategory:** DE.AE-06 — Information on adverse events is provided to authorized staff and tools

**NIST SP 800-53 Ref:** IR-04, PM-15, PM-16, RA-04, RA-10

## Implementation Example

> Use cybersecurity software to generate alerts and provide them to the security operations center (SOC) for triage and disposition

## Alma Security Implementation

GuardDuty findings route to the SOC team via SNS-to-Slack integration, delivering real-time alerts to the dedicated #security-alerts channel during business hours. SentinelOne generates automated alerts to the SOC console with threat classification and recommended response actions. O365 ATP alerts surface through the Microsoft 365 Defender portal. The on-call SOC analyst receives PagerDuty escalations for High and Critical severity findings outside business hours, though the alert routing path is still being optimized to reduce noise.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
- [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
