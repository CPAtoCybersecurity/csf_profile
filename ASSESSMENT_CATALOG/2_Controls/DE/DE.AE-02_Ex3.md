# DE.AE-02 Ex3: Manual Log Review for Non-Automated Systems

**Subcategory:** DE.AE-02 — Potentially adverse events are analyzed to better understand associated activities

**NIST SP 800-53 Ref:** AU-06, CA-07, IR-04, SI-04

## Implementation Example

> Regularly conduct manual reviews of log events for technologies that cannot be sufficiently monitored through automation

## Alma Security Implementation

The SOC team conducts weekly manual reviews of Slack workspace audit logs, physical access badge reader logs, and SaaS application admin console events that fall outside automated GuardDuty and SentinelOne coverage. Nadia Khan assigns rotating review duties to SOC analysts who document findings in the ticketing system. Systems without API-based log forwarding are prioritized for manual review until custom cross-source correlation scripts are deployed.

## Artifacts

- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
