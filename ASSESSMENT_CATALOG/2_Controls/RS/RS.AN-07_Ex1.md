# RS.AN-07 Ex1: Incident Data and Metadata Collection and Preservation

**Subcategory:** RS.AN-07 — Incident data and metadata are collected, and their integrity and provenance are preserved

**NIST SP 800-53 Ref:** AU-07, IR-04, IR-06

## Implementation Example

> Collect, preserve, and safeguard the integrity of all pertinent incident data and metadata (e.g., packet captures, logs, images) based on evidence preservation and chain-of-custody procedures

## Alma Security Implementation

SOC analysts collect incident data including SentinelOne endpoint telemetry, SIEM log exports, GuardDuty finding snapshots, and network flow data during investigations. Collected evidence is stored in access-controlled repositories with hash-based integrity verification. Chain-of-custody documentation is maintained within ServiceNow incident records, tracking who collected each evidence item, when, and from which source system.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1001](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
