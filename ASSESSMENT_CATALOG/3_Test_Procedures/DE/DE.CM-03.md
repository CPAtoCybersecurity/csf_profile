# DE.CM-03: Personnel activity and technology usage are monitored to find potentially adverse events

**Function:** DETECT (DE) | **Category:** DE.CM — Continuous Monitoring
**NIST SP 800-53 Ref:** AC-02, AU-12, AU-13, CA-07, CM-10, CM-11
**Implementation Examples:** 3 (Ex1–Ex3)

## Scope & Applicability

Personnel activity and technology usage monitoring across Alma Security's AWS production/staging environment, the Redwood City Windows domain, and corporate SaaS tools. Covers all employees and any privileged or service accounts with logical access.

Slack workspace monitoring is assessed under [DE.CM-09](./DE.CM-09.md). Endpoint application control, including SentinelOne, is assessed under [PR.PS-05](../PR/PR.PS-05.md). Privileged-account usage review is assessed under [PR.AA-02](../PR/PR.AA-02.md). Those steps are out of scope here so this procedure scores only DE.CM-03.

## Continuous Monitoring Indicators

- Daily IAM anomaly review completion (Ex2)
- Failed-authentication alert volume and time to review (Ex2)
- Behavior-analytics detection coverage, including platform-native GuardDuty and O365 ATP baselines where dedicated UBA tooling is not deployed (Ex1)
- Deception technology trigger events, if deployed (Ex3)

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|-----------|-------------------|
| E1 | Review CloudTrail configuration and confirm IAM authentication events, including failures, are logged | CloudTrail trail configuration; sample IAM authentication event logs |
| E2 | Review SSO authentication logging configuration across Windows Authenticator and Palo Alto 2FA | SSO/authentication log samples; system configuration documentation |
| E3 | Review Active Directory authentication log collection on the Windows Domain Controller, including failures and account lockouts | Active Directory Domain Controller authentication log samples |
| E4 | Review GuardDuty behavioral baseline capabilities for AWS API call patterns and assess coverage for insider-threat indicators | GuardDuty behavioral detection finding examples; detector configuration showing behavioral finding types enabled |
| E5 | Evaluate O365 ATP user behavior analytics for email and collaboration activity | O365 ATP user behavior analytics configuration and sample anomaly findings |
| E6 | Review documentation for dedicated user behavior analytics (UBA) tooling, deployed or planned | UBA tooling configuration or roadmap documentation, or confirmation that none exists and that GuardDuty and O365 ATP provide the platform-native coverage |
| E7 | Review documentation for deception technology (honeypots, honeytokens, canary accounts), deployed or planned | Deception technology deployment configuration, or documented rationale or roadmap if not deployed |
| E8 | Review the Acceptable Use Policy for employee monitoring and privacy notice language | Acceptable Use Policy document |

### Interview

| # | Role | Key Questions |
|---|------|---------------|
| I1 | Detection & Response Lead | What personnel-activity monitoring capabilities exist today? Is behavior-analytics tooling planned? What does the daily anomaly-review process actually cover? |
| I2 | IAM/IT team member | How are failed-authentication alerts triaged? Is Active Directory Domain Controller authentication logged and reviewed? |

### Test

| # | Procedure | Pass Criteria |
|---|-----------|---------------|
| T1 | Sample a failed authentication event and confirm alerting fires and is logged | Alert generated and visible to the IAM team within the documented review cadence |
| T2 | Attempt to identify detection logic for credential stuffing, brute force, or impossible-travel patterns in existing tooling | Detection logic exists and can be demonstrated for at least one of the three patterns |
| T3 | If deception technology exists, verify a triggered decoy generates an alert | Alert generated and routed to the security team |

## Evidence Requirements

- [ ] CloudTrail IAM authentication event samples, including failures
- [ ] SSO authentication log samples (all systems in use)
- [ ] Active Directory Domain Controller authentication log samples, if applicable
- [ ] GuardDuty behavioral detection finding examples
- [ ] O365 ATP user behavior analytics configuration
- [ ] Behavior-analytics tooling configuration or roadmap documentation
- [ ] Documentation of detection logic for credential stuffing, brute force, or impossible-travel scenarios
- [ ] Deception technology deployment configuration, or documented rationale or roadmap if not deployed
- [ ] Employee monitoring / Acceptable Use Policy

## Pass/Fail Criteria

DE.CM-03 is adequately implemented when all three NIST-recognized implementation examples are addressed: (1) behavior analytics for insider-threat detection is deployed or formally planned, (2) logical access monitoring includes centralized logging, alerting, and detection for at least one specific attack pattern, and (3) deception technology is deployed or formally planned. A documented employee-monitoring policy is a prerequisite for lawful monitoring but does not itself satisfy any implementation example.

Platform-native behavioral analytics satisfy example (1). At Alma that coverage is GuardDuty behavioral baselines for AWS API call patterns and O365 ATP user behavior analytics for email and collaboration activity. A dedicated UBA product is not required when that coverage is demonstrated.

## Alma Security Context

Alma is a continuous-authentication SaaS provider, which makes the sensitivity of the authentication data it processes a specific driver for insider-threat detection (Ex1). Dedicated user behavior analytics tooling is not deployed. Alma relies on platform-native behavioral analytics from GuardDuty and O365 ATP, supplemented by SOC review of flagged anomalies. Current monitoring is concentrated in logical access monitoring (Ex2): CloudTrail IAM logging, SSO authentication logs across Windows Authenticator and Palo Alto 2FA, Active Directory authentication logs on the Windows Domain Controller, failed-authentication alerting, and daily IAM team review. No deception technology is documented as deployed. Future consideration follows the Incident Response Enhancement project.

## Related

- **Artifacts:** [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md), [SOC Ticket 1001 Phishing](../../5_Artifacts/Tickets/TKT-SOC-1001-phishing.md), [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md), [SOC Ticket 1004](../../5_Artifacts/Tickets/TKT-SOC-1004.md), [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
- **Controls:** [DE.CM-03_Ex1](../../2_Controls/DE/DE.CM-03_Ex1.md), [DE.CM-03_Ex2](../../2_Controls/DE/DE.CM-03_Ex2.md), [DE.CM-03_Ex3](../../2_Controls/DE/DE.CM-03_Ex3.md)
- **Observations:** [DE.CM-03-Q1](../../4_Observations/DE/DE.CM-03-Q1.md)
