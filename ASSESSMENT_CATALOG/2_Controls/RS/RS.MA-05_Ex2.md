# RS.MA-05 Ex2: Considering Operational Disruption During Recovery

**Subcategory:** RS.MA-05 — The criteria for initiating incident recovery are applied

**NIST SP 800-53 Ref:** IR-04, IR-08

## Implementation Example

> Take the possible operational disruption of incident recovery activities into account

## Alma Security Implementation

Before initiating recovery, the incident lead coordinates with business unit owners to assess potential service disruptions from recovery actions such as system reimaging, credential resets, or network reconfiguration. The recovery plan in ServiceNow includes a business impact assessment section where estimated downtime and affected services are documented. For customer-facing systems, Nadia Khan's D&R team schedules recovery windows during off-peak hours when possible and coordinates with the communications team to prepare customer notifications.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
