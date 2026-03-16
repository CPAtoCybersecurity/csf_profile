# PR.IR-01_Ex1: Network Segmentation

**Subcategory:** PR.IR-01 — Networks and network services are protected from unauthorized logical access and usage

**NIST SP 800-53 Ref:** AC-04, SC-01, SC-07, SC-22, SC-46

## Implementation Example

> Ex1: Network segmentation is used to separate networks into security zones based on trust level, data sensitivity, or business function to limit unauthorized lateral movement.

## Alma Security Implementation

Alma segments its AWS production VPC into distinct subnets (public ALBs, application-tier Kubernetes nodes, private databases) with Security Groups enforcing micro-segmentation and Network ACLs providing secondary filtering. On-premises at Redwood City, the Palo Alto firewall enforces zone-based segmentation between corporate, server, and management VLANs. No formal segmentation policy document exists, Kubernetes namespace-level network policies are not enforced across all namespaces, and regular segmentation testing has not been conducted.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Physical Security Policy](../../5_Artifacts/Policies/POL-physical-security.md)
- [Backup and Restore Procedure](../../5_Artifacts/Procedures/PROC-backup-restore.md)
