# DE.CM-02 Ex1: Physical Access Log Monitoring

**Subcategory:** DE.CM-02 — The physical environment is monitored to find potentially adverse events

**NIST SP 800-53 Ref:** CA-07, PE-03, PE-06, PE-20

## Implementation Example

> Monitor logs from physical access control systems (e.g., badge readers) to find unusual access patterns and failed access attempts

## Alma Security Implementation

The Redwood City office badge reader system logs all entry and exit events including timestamps, badge IDs, and access point locations. Failed badge attempts and after-hours access generate alerts to the facilities team. The SOC team includes physical access anomalies in weekly manual log reviews, cross-referencing badge events with employee schedules to identify unusual patterns such as repeated access failures or entries during non-working hours.

## Artifacts

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
