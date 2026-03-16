# PR.IR-01_Ex4: Network Access Control for Device Connectivity

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex4: Network access control (NAC) mechanisms are used to verify device identity and posture before granting connectivity to organizational networks.

## Alma Security Implementation

Alma does not operate a dedicated NAC solution. On-premises network access relies on physical badge access and Palo Alto zone-based policies with no automated device posture assessment. In the Kubernetes environment, workload connectivity is governed by network policies and Security Groups rather than traditional NAC. No mechanism exists to verify device health, patch status, or compliance before granting network access.

## Artifacts

- [Physical Security Policy](../../5_Artifacts/Policies/POL-physical-security.md)
- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
