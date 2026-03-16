# RS.MI-01 Ex1: Automated Incident Containment

**Subcategory:** RS.MI-01 — Incidents are contained

**NIST SP 800-53 Ref:** IR-04

## Implementation Example

> Cybersecurity technologies (e.g., antivirus software) and cybersecurity features of other technologies (e.g., operating systems) automatically contain incidents

## Alma Security Implementation

SentinelOne endpoint protection provides automated containment through network isolation of compromised endpoints upon detection of confirmed malicious activity. GuardDuty findings above medium severity trigger automated remediation via AWS Lambda functions that isolate affected EC2 instances by applying restrictive security groups. These automated containment actions execute within minutes of detection, reducing the window of lateral movement while the SOC team assesses the full scope of the incident.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
