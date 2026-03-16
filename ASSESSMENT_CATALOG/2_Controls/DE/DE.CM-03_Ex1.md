# DE.CM-03 Ex1: User Behavior Analytics

**Subcategory:** DE.CM-03 — Personnel activity and technology usage are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-02, AU-12, AU-13, CA-07, CM-10, CM-11

## Implementation Example

> Use behavior analytics software to detect anomalous user activity to mitigate insider threats

## Alma Security Implementation

GuardDuty applies behavioral baselines to AWS API call patterns, detecting anomalous activity such as unusual resource access, privilege escalation attempts, and API calls from atypical geolocations. O365 ATP includes user behavior analytics for email and collaboration activity, flagging anomalous login patterns and mass file downloads. Dedicated user behavior analytics tooling is not deployed; Alma relies on platform-native behavioral detection capabilities supplemented by SOC analyst investigation of flagged anomalies.

## Artifacts

- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
