# DE.AE-08 Ex1: Incident Declaration Criteria Application

**Subcategory:** DE.AE-08 — Incidents are declared when adverse events meet the defined incident criteria

**NIST SP 800-53 Ref:** IR-04, IR-08

## Implementation Example

> Apply incident criteria to known and assumed characteristics of activity in order to determine whether an incident should be declared

## Alma Security Implementation

The incident response playbook defines severity-based incident declaration criteria: Critical (customer data exposure, production service compromise), High (lateral movement detected, credential theft), Medium (policy violations, suspicious access patterns), and Low (reconnaissance activity, failed attacks). The SOC Manager applies these criteria to GuardDuty findings, SentinelOne alerts, and manually reported events, declaring incidents when thresholds are met and initiating the formal incident response workflow with designated responders.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
