# RS.MI-01 Ex2: Manual Containment Action Selection

**Subcategory:** RS.MI-01 — Incidents are contained

**NIST SP 800-53 Ref:** IR-04

## Implementation Example

> Allow incident responders to manually select and perform containment actions

## Alma Security Implementation

The incident response playbook defines manual containment options available to SOC analysts and incident responders, including network segment isolation, account suspension, firewall rule injection, and DNS sinkholing. Nadia Khan's D&R team members have pre-authorized access to execute containment actions through SentinelOne console, AWS security group modifications, and Palo Alto firewall policy changes. Each manual containment action is logged in the ServiceNow incident ticket with justification, timestamp, and the responder who executed it.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [SOC Ticket TKT-SOC-1001](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
