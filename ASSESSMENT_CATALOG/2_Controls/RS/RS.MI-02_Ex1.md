# RS.MI-02 Ex1: Automated Incident Eradication

**Subcategory:** RS.MI-02 — Incidents are eradicated

**NIST SP 800-53 Ref:** IR-04

## Implementation Example

> Cybersecurity technologies and cybersecurity features of other technologies (e.g., operating systems) automatically eradicate incidents

## Alma Security Implementation

SentinelOne provides automated threat eradication through its remediation and rollback capabilities, which can kill malicious processes, quarantine malicious files, and reverse unauthorized system changes. GuardDuty auto-remediation workflows trigger Lambda functions that revoke compromised IAM credentials, terminate unauthorized EC2 instances, and remove malicious security group rules. These automated eradication actions are logged in CloudTrail and correlated to the parent ServiceNow incident ticket for audit trail completeness.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
