# DE.CM-03 Ex2: Logical Access Pattern Monitoring

**Subcategory:** DE.CM-03 — Personnel activity and technology usage are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-02, AU-12, AU-13, CA-07, CM-10, CM-11

## Implementation Example

> Monitor logs from logical access control systems to find unusual access patterns and failed access attempts that may indicate credential theft or misuse

## Alma Security Implementation

CloudTrail logs capture all IAM authentication events including failed access attempts, console logins from new device fingerprints, and programmatic access from unusual IP ranges. Active Directory authentication logs on the Windows Domain Controller track failed login attempts, account lockouts, and Kerberos ticket anomalies. The SOC team monitors for credential stuffing patterns, brute force attempts, and impossible travel scenarios across both cloud and on-premises authentication systems.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md)
