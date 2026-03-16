# PR.IR-02_Ex2: Adequate Environmental Controls

**Subcategory:** PR.IR-02 — The organization's technology assets are protected from environmental threats

**NIST SP 800-53 Ref:** CP-02, PE-09, PE-10, PE-11, PE-12, PE-13, PE-14, PE-15, PE-17, PE-18, PE-23

## Implementation Example

> Ex2: Adequate environmental controls (e.g., temperature, humidity, power conditioning) are maintained and monitored to ensure technology assets operate within manufacturer-specified parameters.

## Alma Security Implementation

Alma operates HVAC monitoring at the Redwood City data center tracking temperature and humidity within manufacturer-specified ranges, with UPS systems providing battery backup and power conditioning. AWS cloud workloads inherit Amazon's environmental controls under the shared responsibility model. UPS capacity planning, battery replacement schedules, and load testing documentation is limited, and environmental monitoring is not integrated with the IT incident management process.

## Artifacts

- [Physical Security Policy](../../5_Artifacts/Policies/POL-physical-security.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
