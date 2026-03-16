# PR.AA-06 Ex3: Data Center Physical Security and Environmental Controls

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-9, PE-10, PE-11, PE-12, PE-13, PE-14

## Implementation Example

> Implementing enhanced physical security and environmental controls for data center and server room facilities, including multi-factor physical authentication, environmental monitoring, surveillance, and access logging commensurate with the criticality of hosted assets

## Alma Security Implementation

Alma Security's server room at the Redwood City office houses the Windows Domain Controller, network switching infrastructure, and Palo Alto firewall appliances, designated as a high-security zone with badge-plus-PIN authentication restricted to 11 authorized individuals reviewed monthly. A dedicated security camera monitors the entrance and interior rack area with 90-day tamper-evident footage retention, and the ACS logs all entry/exit events with badge ID, timestamp, and PIN verification status. Environmental monitoring covers temperature (80F/27C threshold), humidity (40-60% RH), water leak detection, and smoke detection, with a dedicated UPS (30-minute runtime) and automatic transfer to backup diesel generator. AWS data center physical security for production Kubernetes workloads is validated annually through the AWS SOC 2 Type II report review.

## Artifacts

- [Physical Security Policy](../../5_Artifacts/Policies/POL-physical-security.md)
- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [Backup and Restore Test Report](../../5_Artifacts/Reports/RPT-backup-restore-test.md)
- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
