# RS.MA-05 Ex1: Applying Recovery Initiation Criteria

**Subcategory:** RS.MA-05 — The criteria for initiating incident recovery are applied

**NIST SP 800-53 Ref:** IR-04, IR-08

## Implementation Example

> Apply incident recovery criteria to known and assumed characteristics of the incident to determine whether incident recovery should be initiated

## Alma Security Implementation

The incident response playbook defines recovery initiation criteria requiring confirmation of containment effectiveness, threat eradication verification, and environmental stability assessment before transitioning to recovery. The incident lead evaluates incident characteristics against these criteria and documents the recovery readiness determination in ServiceNow. For major incidents, the CISO approves recovery initiation after reviewing the incident lead's assessment of containment completeness and residual risk.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1005](../../5_Artifacts/Tickets/TKT-SOC-1005.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
