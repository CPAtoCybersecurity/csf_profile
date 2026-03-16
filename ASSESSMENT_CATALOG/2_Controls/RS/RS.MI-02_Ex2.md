# RS.MI-02 Ex2: Manual Eradication Action Selection

**Subcategory:** RS.MI-02 — Incidents are eradicated

**NIST SP 800-53 Ref:** IR-04

## Implementation Example

> Allow incident responders to manually select and perform eradication actions

## Alma Security Implementation

The incident response playbook defines manual eradication procedures including system reimaging from gold images, credential rotation for compromised accounts, malware removal, persistence mechanism elimination, and registry cleanup. Nadia Khan's D&R team has documented runbooks for common eradication scenarios in ServiceNow knowledge base articles. Each manual eradication action requires documentation of the action taken, evidence of successful removal, and verification testing before the endpoint is returned to production.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1001](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
