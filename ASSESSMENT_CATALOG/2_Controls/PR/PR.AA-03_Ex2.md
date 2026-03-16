# PR.AA-03 Ex2: Device Authentication and Network Access Control

**Subcategory:** PR.AA-03 — Users, services, and hardware are authenticated

**NIST SP 800-53 Ref:** IA-3, IA-3(1), AC-17

## Implementation Example

> Authenticating devices before granting network access using certificate-based authentication, 802.1X, or device compliance checks to ensure only authorized and healthy devices connect to organizational networks

## Alma Security Implementation

Alma Security authenticates devices on the Redwood City office network using 802.1X port-based authentication through the Palo Alto firewall, with domain-joined devices presenting machine certificates for wired access and being placed on the trusted VLAN. SentinelOne endpoint agents provide secondary device health attestation, reporting OS patch level, agent health, and threat detection status for compliance monitoring. In AWS, EC2 instances and EKS worker nodes authenticate using IAM instance profiles with temporary credentials, and Kubernetes pods use projected service account tokens with audience and expiration constraints. CI/CD pipeline scanning enforces that no static credentials are embedded in container images.

## Artifacts

- [Hardware Inventory](../../5_Artifacts/Inventories/INV-hardware-inventory.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
