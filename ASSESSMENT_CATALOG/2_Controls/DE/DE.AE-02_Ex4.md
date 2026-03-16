# DE.AE-02 Ex4: Log Analysis Reporting

**Subcategory:** DE.AE-02 — Potentially adverse events are analyzed to better understand associated activities

**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, SI-04

## Implementation Example

> Use log analysis tools to generate reports on their findings

## Alma Security Implementation

GuardDuty generates automated findings reports surfaced through the AWS Security Hub console, providing severity-ranked summaries of detected threats across all accounts. SentinelOne produces weekly endpoint threat reports summarizing detections, mitigations, and unresolved alerts. The SOC Manager validates severity classifications and compiles a monthly detection summary report that tracks TTD metrics against the current 7-hour baseline and the January 2027 target of under 4 minutes.

## Artifacts

- [Vulnerability Scan Summary](../../5_Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
