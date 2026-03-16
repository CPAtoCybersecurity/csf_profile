# DE.AE-02 Ex1: SIEM-Based Continuous Log Monitoring

**Subcategory:** DE.AE-02 — Potentially adverse events are analyzed to better understand associated activities

**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, SI-04

## Implementation Example

> Use security information and event management (SIEM) or other tools to continuously monitor log events for known malicious and suspicious activity

## Alma Security Implementation

Alma Security uses AWS CloudTrail for API activity logging across all accounts and AWS GuardDuty for automated threat detection, providing SIEM-like continuous monitoring of cloud infrastructure events. GuardDuty analyzes CloudTrail management and data events, VPC Flow Logs, and DNS query logs to generate findings for known malicious activity patterns. The SOC team reviews GuardDuty findings during business hours with on-call rotation for after-hours critical alerts, though 24/7 continuous monitoring is not yet operational.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
