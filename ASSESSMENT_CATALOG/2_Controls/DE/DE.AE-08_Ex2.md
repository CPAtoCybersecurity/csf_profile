# DE.AE-08 Ex2: False Positive Management in Incident Declaration

**Subcategory:** DE.AE-08 — Incidents are declared when adverse events meet the defined incident criteria

**NIST SP 800-53 Ref:** IR-04, IR-08

## Implementation Example

> Take known false positives into account when applying incident criteria

## Alma Security Implementation

The SOC team maintains a documented false positive registry in the ticketing system, cataloging suppressed GuardDuty finding types, SentinelOne exclusions, and O365 ATP override rules with business justification for each. The SOC Manager reviews the false positive registry monthly to prevent alert fatigue from degrading incident declaration accuracy. New suppression rules require documented approval and are re-validated quarterly to ensure legitimate threats are not inadvertently excluded as detection environments evolve.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
