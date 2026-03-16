# RS.MA-03 Ex3: Balancing Recovery Speed Against Evidence Preservation

**Subcategory:** RS.MA-03 — Incidents are categorized and prioritized

**NIST SP 800-53 Ref:** IR-04, IR-05, IR-06

## Implementation Example

> Select incident response strategies for active incidents by balancing the need to quickly recover from an incident with the need to reliably identify the attacker

## Alma Security Implementation

The incident lead evaluates response strategy trade-offs between rapid service restoration and thorough forensic investigation on a per-incident basis. For customer-impacting incidents, containment and service restoration take priority with forensic imaging conducted in parallel to preserve evidence. For non-time-critical incidents, extended investigation windows are authorized to support attacker attribution and comprehensive root cause analysis. Strategy decisions are documented in ServiceNow with justification.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
