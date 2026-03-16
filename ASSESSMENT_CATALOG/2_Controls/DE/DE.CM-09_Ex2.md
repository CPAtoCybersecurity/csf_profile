# DE.CM-09 Ex2: Authentication Attack Monitoring

**Subcategory:** DE.CM-09 — Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-04, AC-09, AU-12, CA-07, CM-03, CM-06, CM-10, CM-11, SC-34, SC-35, SI-04, SI-07

## Implementation Example

> Monitor authentication attempts to identify attacks against credentials and unauthorized credential use

## Alma Security Implementation

CloudTrail monitors all IAM authentication events including console sign-in failures, programmatic access denials, and MFA challenge failures across AWS accounts. Active Directory logs capture Kerberos authentication anomalies, NTLM downgrade attempts, and account lockout events on the Windows Domain Controller. GuardDuty generates findings for brute force attacks, credential access from known malicious IPs, and impossible travel scenarios indicating stolen credential use.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
