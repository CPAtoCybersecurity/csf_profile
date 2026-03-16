# RS.MA-03 Ex2: Scope-Based Incident Prioritization

**Subcategory:** RS.MA-03 — Incidents are categorized and prioritized

**NIST SP 800-53 Ref:** IR-04, IR-05, IR-06

## Implementation Example

> Prioritize incidents based on their scope, likely impact, and time-critical nature

## Alma Security Implementation

Incident prioritization follows a severity-based model documented in the incident response playbook, weighting scope (number of affected systems/users), likely business impact (revenue, reputation, regulatory), and time-critical nature (active data exfiltration, ransomware encryption in progress). The SOC Manager has authority to re-prioritize active incidents as scope evolves. When multiple incidents are active simultaneously, resource allocation follows the priority ranking with critical incidents receiving dedicated analyst assignment.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
