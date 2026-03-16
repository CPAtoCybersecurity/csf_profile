# RS.AN-08 Ex2: Automated IOC Scanning Across Targets

**Subcategory:** RS.AN-08 — An incident's magnitude is estimated and validated

**NIST SP 800-53 Ref:** IR-04, IR-08, RA-03, RA-07

## Implementation Example

> Automatically run tools on targets to look for indicators of compromise and evidence of persistence

## Alma Security Implementation

SentinelOne automated threat hunting queries execute IOC sweeps across all managed endpoints when new indicators are identified during an active incident. GuardDuty auto-remediation rules trigger automated scanning of AWS resources for related compromise indicators. These automated capabilities reduce mean time to scope estimation, though manual analysis remains necessary for complex multi-vector incidents that span both on-premises and cloud environments.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket TKT-SOC-1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
