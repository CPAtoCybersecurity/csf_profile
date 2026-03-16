# DE.AE-06 Ex3: Automated Ticket Creation for Adverse Events

**Subcategory:** DE.AE-06 — Information on adverse events is provided to authorized staff and tools

**NIST SP 800-53 Ref:** IR-04, PM-15, PM-16, RA-04, RA-10

## Implementation Example

> Automatically create and assign tickets in the organization's ticketing system when certain types of adverse events are detected

## Alma Security Implementation

SentinelOne is configured to auto-create tickets in the SOC ticketing queue for High and Critical severity endpoint detections, pre-populated with threat details, affected host, and recommended containment actions. GuardDuty High-severity findings trigger automated ticket creation via Lambda-to-ticketing integration. Automated tickets are assigned to the on-duty SOC analyst based on the current rotation schedule maintained by Nadia Khan.

## Artifacts

- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
- [SOC Ticket 1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
