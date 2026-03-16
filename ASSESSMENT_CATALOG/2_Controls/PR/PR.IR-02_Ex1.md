# PR.IR-02_Ex1: Protection from Environmental Threats

**Subcategory:** PR.IR-02 — The organization's technology assets are protected from environmental threats

**NIST SP 800-53 Ref:** CP-02, PE-09, PE-10, PE-11, PE-12, PE-13, PE-14, PE-15, PE-17, PE-18, PE-23

## Implementation Example

> Ex1: Technology assets are protected from environmental threats such as flooding, fire, extreme heat, and other natural or man-made hazards through physical safeguards and site selection.

## Alma Security Implementation

Alma protects the Redwood City data center with fire suppression and HVAC monitoring systems that alert operations staff on environmental deviations. AWS production infrastructure inherits Amazon's physical and environmental controls under the shared responsibility model, with multi-AZ deployment mitigating single-zone failures. No formal environmental risk assessment exists for the Redwood City facility, fire suppression testing records have not been reviewed, and flood detection sensor deployment is unconfirmed.

## Artifacts

- [Physical Security Policy](../../5_Artifacts/Policies/POL-physical-security.md)
- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
- [Backup Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
