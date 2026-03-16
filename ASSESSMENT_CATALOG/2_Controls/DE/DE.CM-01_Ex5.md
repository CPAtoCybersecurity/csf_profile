# DE.CM-01 Ex5: Zero Trust Network Monitoring

**Subcategory:** DE.CM-01 — Networks and network services are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-02, AU-12, CA-07, CM-03, SC-05, SC-07, SI-04

## Implementation Example

> Monitor network communications to identify changes in security postures for zero trust purposes

## Alma Security Implementation

Alma's continuous authentication platform inherently monitors session trust signals, with network-layer telemetry from VPC Flow Logs feeding into security posture assessments for cloud workloads. AWS Security Groups enforce microsegmentation between application tiers, and deviations from expected communication patterns generate GuardDuty findings. Full zero trust network architecture adoption is in planning stages, with the current focus on strengthening network monitoring foundations through the Incident Response Enhancement project.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
