# RS.MA-01 Ex1: Automated Incident Reporting from Detection Technologies

**Subcategory:** RS.MA-01 — The incident response plan is executed in coordination with relevant third parties once an incident is declared

**NIST SP 800-53 Ref:** IR-06, IR-07, IR-08, SR-03, SR-08

## Implementation Example

> Detection technologies automatically report confirmed incidents

## Alma Security Implementation

SentinelOne generates automated incident alerts for confirmed endpoint threats including malware detection, suspicious process execution, and behavioral anomalies, routing to Slack #security-alerts and creating ServiceNow SOC tickets. GuardDuty auto-generates findings for AWS infrastructure threats and feeds into the centralized alerting pipeline. Automated reporting ensures incidents are registered in the response workflow without depending on manual analyst observation.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1001](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
