# DE.CM-01 Ex1: Network Service Monitoring

**Subcategory:** DE.CM-01 — Networks and network services are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-02, AU-12, CA-07, CM-03, SC-05, SC-07, SI-04

## Implementation Example

> Monitor DNS, BGP, and other network services for adverse events

## Alma Security Implementation

AWS DNS query logging captures all Route 53 resolver queries across VPCs, forwarding to CloudWatch Logs for anomaly detection of DNS tunneling, DGA domains, and data exfiltration patterns. VPC Flow Logs record network traffic metadata for all ENIs, enabling detection of unauthorized connections, port scanning, and lateral movement. GuardDuty analyzes DNS and network flow data to generate findings for known command-and-control communication patterns.

## Artifacts

- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Incident Response Playbook](../../5_Artifacts/Procedures/PROC-incident-response-playbook.md)
- [Information Security Policy](../../5_Artifacts/Policies/POL-information-security.md)
