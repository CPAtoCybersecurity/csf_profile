# RS.AN-06 Ex1: Individual Responder Action Logging

**Subcategory:** RS.AN-06 — Actions performed during an investigation are recorded, and the records' integrity and provenance are preserved

**NIST SP 800-53 Ref:** AU-07, IR-04, IR-06

## Implementation Example

> Require each incident responder and others (e.g., system administrators, cybersecurity engineers) to record their actions during an investigation to support the integrity of the investigation and any potential legal actions

## Alma Security Implementation

SOC analysts and incident responders log all investigation actions in ServiceNow SOC tickets with timestamps, actions taken, and rationale. Each responder updates the ticket under their own identity, creating an attributable audit trail. SentinelOne console actions are similarly logged against individual analyst accounts, providing corroboration between ticketing records and tool-level activity logs.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1001](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [SOC Ticket TKT-SOC-1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
