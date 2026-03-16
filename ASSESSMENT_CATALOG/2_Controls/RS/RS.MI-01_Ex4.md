# RS.MI-01 Ex4: Automated Network Quarantine for Compromised Endpoints

**Subcategory:** RS.MI-01 — Incidents are contained

**NIST SP 800-53 Ref:** IR-04

## Implementation Example

> Automatically transfer compromised endpoints to a remediation virtual local area network (VLAN)

## Alma Security Implementation

SentinelOne's network quarantine capability automatically isolates compromised endpoints from the production network upon threat detection, preventing lateral movement while maintaining agent communication for remote investigation. For AWS workloads, GuardDuty auto-remediation Lambda functions move compromised EC2 instances to an isolated remediation security group that blocks all inbound and outbound traffic except management access from the SOC team's jump box. The isolated assets remain accessible to Nadia Khan's D&R team for forensic analysis through dedicated management interfaces.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
