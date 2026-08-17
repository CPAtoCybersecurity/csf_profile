# DE.CM-03: Personnel activity and technology usage are monitored to find potentially adverse events

**Function:** DETECT | **Category:** DE.CM - Continuous Monitoring
**NIST SP 800-53 Ref:** AC-2, AU-12, AU-13, CA-7, CM-10, CM-11
**Implementation Examples:** 3 (Ex1-Ex3)

## Scope & Applicability

Personnel activity and technology usage monitoring across Alma Security's AWS production/staging environment, the Redwood City Windows domain, and corporate SaaS tools. Covers all employees and any privileged or service accounts with logical access.

## Continuous Monitoring Indicators

- Daily IAM anomaly review completion (Ex2)
- Failed-authentication alert volume and time to review (Ex2)
- Behavior-analytics detection coverage, if deployed (Ex1)
- Deception technology trigger events, if deployed (Ex3)

## Test Procedures

### Examine

| # | Procedure | Expected Evidence |
|---|---|---|
| E1 | Review CloudTrail configuration and confirm IAM authentication events, including failures, are logged | CloudTrail trail configuration; sample IAM authentication event logs |
| E2 | Review SSO authentication logging configuration across Windows Authenticator and Palo Alto 2FA | SSO/authentication log samples; system configuration documentation |
| E3 | Review documentation for dedicated user behavior analytics (UBA) tooling, deployed or planned | UBA tooling configuration or roadmap documentation, or confirmation that none exists |
| E4 | Review documentation for deception technology (honeypots, honeytokens, canary accounts), deployed or planned | Deception technology deployment configuration, or documented rationale/roadmap if not deployed |
| E5 | Review the Acceptable Use Policy for employee monitoring and privacy notice language | Acceptable Use Policy document |

### Interview

| # | Role | Key Questions |
|---|---|---|
| I1 | Detection & Response Lead | What personnel-activity monitoring capabilities exist today? Is behavior-analytics tooling planned? What does the daily anomaly-review process actually cover? |
| I2 | IAM/IT team member | How are failed-authentication alerts triaged? Is Active Directory Domain Controller authentication logged and reviewed? |

### Test

| # | Procedure | Pass Criteria |
|---|---|---|
| T1 | Sample a failed authentication event and confirm alerting fires and is logged | Alert generated and visible to the IAM team within the documented review cadence |
| T2 | Attempt to identify detection logic for credential stuffing, brute force, or impossible-travel patterns in existing tooling | Detection logic exists and can be demonstrated for at least one of the three patterns |
| T3 | If deception technology exists, verify a triggered decoy generates an alert | Alert generated and routed to the security team |

## Evidence Requirements

- [ ] CloudTrail IAM authentication event samples, including failures
- [ ] SSO authentication log samples (all systems in use)
- [ ] Active Directory Domain Controller authentication log samples, if applicable
- [ ] Behavior-analytics tooling configuration or roadmap documentation
- [ ] Documentation of detection logic for credential stuffing, brute force, or impossible-travel scenarios
- [ ] Deception technology deployment configuration, or documented rationale/roadmap if not deployed
- [ ] Employee monitoring / Acceptable Use Policy

## Pass/Fail Criteria

DE.CM-03 is adequately implemented when all three NIST-recognized implementation examples are addressed: (1) behavior analytics for insider-threat detection is deployed or formally planned, (2) logical access monitoring includes centralized logging, alerting, and detection for at least one specific attack pattern, and (3) deception technology is deployed or formally planned. A documented employee-monitoring policy is a prerequisite for lawful monitoring but does not itself satisfy any implementation example.

## Alma Security Context

Alma is a continuous-authentication SaaS provider, which makes the sensitivity of the authentication data it processes a specific driver for insider-threat detection (Ex1). Current monitoring is concentrated in logical access monitoring (Ex2): CloudTrail IAM logging, SSO authentication logs across Windows Authenticator and Palo Alto 2FA, failed-authentication alerting, and daily IAM team review. No dedicated behavior-analytics tooling or deception technology is documented as deployed or planned.

## Related

- **Artifacts:** (none identified yet in ../5_Artifacts/)
- **Controls:** DE.CM-03_Ex1, DE.CM-03_Ex2, DE.CM-03_Ex3 (../2_Controls/DE/)
- **Observations:** DE.CM-03-Q1 (../4_Observations/DE/)
