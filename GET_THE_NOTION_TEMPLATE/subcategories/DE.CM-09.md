---
id: 'DE.CM-09'
function_id: 'DE'
function_name: 'DETECT'
category_id: 'DE.CM'
category_name: 'Continuous Monitoring'
in_scope: 'Yes'
owner: 'tigan.wang <tigan.wang@almasecurity.com>'
stakeholders: 'jane <jane@almasecurity.com>; john <john@almasecurity.com>'
auditor: 'steve <steve@almasecurity.com>'
nist_800_53: 'AC-04,AC-09,AU-12,CA-07,CM-03,CM-06,CM-10,CM-11,SC-34,SC-35,SI-04,SI-07'
score: 3
target_score: 5
minimum_target: 5
remediation_owner: 'tigan.wang <tigan.wang@almasecurity.com>'
remediation_due: '2026-09-30'
artifact_name:
---

# DE.CM-09 — Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

## Description

Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

## Quarterly Assessment

| Quarter | Actual | Target | Testing Status | Examine | Interview | Test | Obs. Date |
|---------|--------|--------|----------------|---------|-----------|------|-----------|
| Q1 | 2 | 5 | Complete | Yes | Yes | Yes | 07-Feb |
| Q2 | 3 | 5 | Complete | Yes | Yes | Yes | 03-May |
| Q3 | 3 | 5 | Not Started | No | No | No | — |
| Q4 | 3 | 5 | Not Started | No | No | No | — |

**Q1 observations**

O365 ATP monitors email/web traffic. Slack communications monitored for policy violations. Data leak detection capabilities being evaluated.

**Q2 observations**

System monitoring policy documented and approved. O365 ATP tuned for Alma-specific threats. Collaboration service monitoring scope expanded.

## NIST 800-53 References

AC-04,AC-09,AU-12,CA-07,CM-03,CM-06,CM-10,CM-11,SC-34,SC-35,SI-04,SI-07

## Test Procedures

1. Inquiry: CISO, IT Ops, 2. Inspect system monitoring policy, 3. Observe SOC dashboards

## Implementation Examples

- **Ex1:** Monitor email, web, file sharing, collaboration services, and other common attack vectors to detect malware, phishing, data leaks and exfiltration, and other adverse events

  Computing environment monitoring includes: (1) O365 ATP for email and web traffic with Alma-specific threat rules, (2) Slack monitoring for policy violations, (3) system monitoring policy defining coverage scope. Data leak detection capabilities are evaluated for expansion. Collaboration service monitoring covers Outlook 365 and Slack.
- **Ex2:** Monitor authentication attempts to identify attacks against credentials and unauthorized credential reuse

  AC-04,AC-09,AU-12,CA-07,CM-03,CM-06,CM-10,CM-11,SC-34,SC-35,SI-04,SI-07
- **Ex3:** Monitor software configurations for deviations from security baselines

  AC-04,AC-09,AU-12,CA-07,CM-03,CM-06,CM-10,CM-11,SC-34,SC-35,SI-04,SI-07
- **Ex4:** Monitor hardware and software for signs of tampering

  AC-04,AC-09,AU-12,CA-07,CM-03,CM-06,CM-10,CM-11,SC-34,SC-35,SI-04,SI-07
- **Ex5:** Use technologies with a presence on endpoints to detect cyber health issues (e.g., missing patches, malware infections, unauthorized software), and redirect the endpoints to a remediation environment before access is authorized

  AC-04,AC-09,AU-12,CA-07,CM-03,CM-06,CM-10,CM-11,SC-34,SC-35,SI-04,SI-07

## Remediation / Action Plan

Deploy data leak detection capabilities. Expand collaboration service monitoring to cover all sanctioned applications. Tune O365 ATP rules based on false positive analysis.
