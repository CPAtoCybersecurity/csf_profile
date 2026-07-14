---
id: 'DE.CM-03'
function_id: 'DE'
function_name: 'DETECT'
category_id: 'DE.CM'
category_name: 'Continuous Monitoring'
in_scope: 'Yes'
owner: 'nadia.khan <nadia.khan@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'AC-02,AU-12,AU-13,CA-07,CM-10,CM-11'
score: 3
target_score: 5
minimum_target: 5
remediation_owner: 'nadia.khan <nadia.khan@almasecurity.com>'
remediation_due: '2026-08-31'
artifact_name: 'SOC-Ticket-1005'
---

# DE.CM-03 — Personnel activity and technology usage are monitored to find potentially adverse events

## Description

Personnel activity and technology usage are monitored to find potentially adverse events

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | No | Yes | Yes | 06-Feb |
| Q2 | 3 | 5 | Complete | No | Yes | Yes | 02-May |
| Q3 | 3 | 5 | Not Started | No | No | No | — |
| Q4 | 3 | 5 | Not Started | No | No | No | — |

**Q1 observations**

Logical access monitoring via CloudTrail. SSO with Windows Authenticator and Palo Alto 2FA provides authentication logging. IAM team reviews anomalies.

**Q2 observations**

Access pattern monitoring enhanced. Failed authentication tracking and alerting operational. SOC dashboard development 60% complete.

## NIST 800-53 References

AC-02,AU-12,AU-13,CA-07,CM-10,CM-11

## Test Procedures

1. Inquiry: CISO, IAM Team, 2. Inspect logical monitoring policy, 3. Observe SOC dashboards

## Implementation Examples

- **Ex1:** Use behavior analytics software to detect anomalous user activity to mitigate insider threats

  AC-02,AU-12,AU-13,CA-07,CM-10,CM-11
- **Ex2:** Monitor logs from logical access control systems to find unusual access patterns and failed access attempts

  Personnel activity monitoring includes: (1) CloudTrail logging all IAM actions, (2) SSO authentication logs via Windows Authenticator and Palo Alto 2FA, (3) failed authentication alerting and tracking. The IAM team reviews anomalies daily. SOC dashboards (60% complete) will provide consolidated access pattern visibility.
- **Ex3:** Continuously monitor deception technology, including user accounts, for any usage

  AC-02,AU-12,AU-13,CA-07,CM-10,CM-11

## Remediation / Action Plan

Complete SOC dashboard development (currently 60%). Implement automated alerting for anomalous access patterns. Expand failed authentication monitoring to all authentication systems.
