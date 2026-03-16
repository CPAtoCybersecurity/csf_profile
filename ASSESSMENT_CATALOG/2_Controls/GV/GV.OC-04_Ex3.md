# GV.OC-04 Ex3: Resilience Objectives

**Subcategory:** GV.OC-04 — Critical objectives, capabilities, and services that external stakeholders depend on or expect from the organization are understood and communicated
**NIST SP 800-53 Ref:** CP-02(08), PM-08, PM-11, PM-30(01), RA-09

## Implementation Example

> Establish and communicate resilience objectives (e.g., recovery time objectives) for delivering critical capabilities and services.

## Alma Security Implementation

Recovery time objectives (RTOs) and recovery point objectives (RPOs) are defined for all Tier 1 services. The authentication API has a 4-hour RTO and 1-hour RPO. Resilience objectives are communicated to engineering teams and validated through disaster recovery testing. Customer-facing SLA commitments align with documented RTOs.

## Artifacts

- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Software Inventory](../../5_Artifacts/Inventories/INV-software-inventory.md)
