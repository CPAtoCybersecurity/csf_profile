# DE.CM-01 Ex4: Network Flow Baseline Comparison

**Subcategory:** DE.CM-01 — Networks and network services are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-02, AU-12, CA-07, CM-03, SC-05, SC-07, SI-04

## Implementation Example

> Compare actual network flows against baselines to detect deviations

## Alma Security Implementation

VPC Flow Logs are analyzed against established traffic baselines to identify volumetric anomalies, new communication paths between VPCs, and unexpected outbound data transfers. GuardDuty uses machine learning on VPC Flow Log data to detect deviations from normal API call patterns and network behavior for each AWS account. The planned custom cross-source correlation scripts will formalize baseline comparison for cross-platform network traffic analysis.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
