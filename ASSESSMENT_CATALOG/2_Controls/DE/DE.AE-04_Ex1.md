# DE.AE-04 Ex1: Automated Impact and Scope Estimation

**Subcategory:** DE.AE-04 — The estimated impact and scope of adverse events are understood

**NIST SP 800-53 Ref:** PM-09, PM-11, PM-18, PM-28, PM-30

## Implementation Example

> Use SIEMs or other tools to estimate impact and scope, and review and refine the estimates

## Alma Security Implementation

GuardDuty findings include severity ratings (Low/Medium/High) and affected resource identifiers that provide initial automated impact estimation for cloud-based adverse events. SentinelOne threat assessments include scope indicators showing affected endpoints, process trees, and lateral movement signals. The SOC Manager reviews and refines automated severity assessments during triage, factoring in Alma's asset criticality ratings and customer data exposure potential before escalation.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
