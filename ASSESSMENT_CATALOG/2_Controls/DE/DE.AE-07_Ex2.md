# DE.AE-07 Ex2: Asset Inventory Context in Detection

**Subcategory:** DE.AE-07 — Cyber threat intelligence and other contextual information are integrated into the analysis

**NIST SP 800-53 Ref:** PM-16, RA-03, RA-10

## Implementation Example

> Securely provide information from asset inventories to detection technologies, processes, and personnel to help them understand the importance and characteristics of affected assets

## Alma Security Implementation

AWS resource tags and account-level criticality classifications provide asset context to GuardDuty findings, enabling analysts to prioritize based on production vs. development environment and data sensitivity tier. SentinelOne endpoint inventory includes device role, department ownership, and managed status attributes. SOC analysts reference the ServiceNow CMDB during triage to identify asset owners and determine business impact based on asset criticality ratings.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
