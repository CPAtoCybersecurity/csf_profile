# RS.AN-03 Ex2: Vulnerability, Threat, and Threat Actor Identification

**Subcategory:** RS.AN-03 — Analysis is performed to establish what has taken place during an incident and the root cause of the incident

**NIST SP 800-53 Ref:** AU-07, IR-04

## Implementation Example

> Attempt to determine what vulnerabilities, threats, and threat actors were directly or indirectly involved in the incident

## Alma Security Implementation

During incident investigation, SOC analysts correlate IOCs against threat intelligence feeds and vulnerability scan data to identify exploited vulnerabilities and likely threat actors. SentinelOne threat intelligence integration provides automated TTP mapping to MITRE ATT&CK framework. Analysts document identified vulnerabilities, threat vectors, and attribution indicators in ServiceNow incident records to support remediation prioritization and defensive posture improvements.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [SOC Ticket TKT-SOC-1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
