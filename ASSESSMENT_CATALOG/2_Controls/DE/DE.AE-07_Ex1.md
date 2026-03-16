# DE.AE-07 Ex1: Threat Intelligence Feed Integration

**Subcategory:** DE.AE-07 — Cyber threat intelligence and other contextual information are integrated into the analysis

**NIST SP 800-53 Ref:** PM-16, RA-03, RA-10

## Implementation Example

> Securely provide cyber threat intelligence feeds to detection technologies, processes, and personnel

## Alma Security Implementation

AWS GuardDuty consumes Amazon-managed threat intelligence feeds covering known malicious IPs, domains, and cryptocurrency mining indicators, automatically enriching detection findings. O365 ATP integrates Microsoft Threat Intelligence for email threat detection with Alma-specific custom threat rules. The SOC team subscribes to SaaS-sector ISAC threat briefings distributed via encrypted email to authorized D&R personnel for manual integration into investigation workflows.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
