# RS.AN-08 Ex1: Reviewing Additional Targets for Indicators of Compromise

**Subcategory:** RS.AN-08 — An incident's magnitude is estimated and validated

**NIST SP 800-53 Ref:** IR-04, IR-08, RA-03, RA-07

## Implementation Example

> Review other potential targets of the incident to search for indicators of compromise and evidence of persistence

## Alma Security Implementation

When an incident is detected, SOC analysts proactively sweep the broader environment for related IOCs using SentinelOne Deep Visibility queries across all managed endpoints. GuardDuty findings are correlated across AWS accounts to identify lateral movement or additional compromised resources. SIEM retroactive searches match identified IOCs against historical log data to establish whether compromise extends beyond the initially detected system.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
