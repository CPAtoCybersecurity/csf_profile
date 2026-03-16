# PR.AA-06 Ex1: Physical Access Control Systems and Badge Management

**Subcategory:** PR.AA-06 — Physical access to assets is managed, monitored, and enforced commensurate with risk

**NIST SP 800-53 Ref:** PE-2, PE-3, PE-6, PE-8

## Implementation Example

> Implementing physical access control systems (badge readers, biometric scanners, mantraps) to manage and enforce facility access based on role, clearance level, and area sensitivity classification

## Alma Security Implementation

Alma Security manages physical access at the Redwood City headquarters through an electronic badge access control system (ACS) integrated with the HR onboarding workflow in Workday. A physical access matrix maps 8 access zones to 6 role categories, with standard employees receiving building and floor access while restricted areas (server room, security operations) require additional zone-owner authorization. The server room enforces badge-plus-PIN two-factor authentication, and security cameras cover all entry points with 90-day footage retention. Badge deactivation is included in the ServiceNow offboarding checklist, with simultaneous execution alongside Active Directory account disablement for involuntary terminations.

## Artifacts

- [Physical Security Policy](../../Artifacts/Policies/POL-physical-security.md)
- [Access Management Policy](../../Artifacts/Policies/POL-access-management.md)
- [Hardware Inventory](../../Artifacts/Inventories/INV-hardware-inventory.md)
