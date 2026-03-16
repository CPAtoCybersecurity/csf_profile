# RS.AN-03 Ex1: Incident Event Sequencing and Asset Impact Identification

**Subcategory:** RS.AN-03 — Analysis is performed to establish what has taken place during an incident and the root cause of the incident

**NIST SP 800-53 Ref:** AU-07, IR-04

## Implementation Example

> Determine the sequence of events that occurred during the incident and which assets and resources were involved

## Alma Security Implementation

Alma Security SOC analysts reconstruct incident timelines using correlated data from SentinelOne endpoint telemetry, GuardDuty findings, and centralized SIEM log aggregation. Each incident ticket in ServiceNow documents the event sequence with timestamps, affected assets, and data flows. The D&R team under Nadia Khan maps involved assets against the CMDB to identify blast radius and data sensitivity classifications.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1001](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
