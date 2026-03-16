# DE.CM-09 Ex4: Hardware and Software Tamper Detection

**Subcategory:** DE.CM-09 — Computing hardware and software, runtime environments, and their data are monitored to find potentially adverse events

**NIST SP 800-53 Ref:** AC-04, AC-09, AU-12, CA-07, CM-03, CM-06, CM-10, CM-11, SC-34, SC-35, SI-04, SI-07

## Implementation Example

> Monitor hardware and software for signs of tampering

## Alma Security Implementation

SentinelOne monitors endpoint operating system integrity, detecting rootkit installation attempts, kernel-level modifications, and unauthorized driver loading on managed devices. AWS CloudTrail detects unauthorized modifications to AMIs, Lambda function code, and container images through API event analysis. SentinelOne's anti-tamper protection prevents disabling or modifying the agent without administrative authorization, ensuring continuous endpoint monitoring integrity.

## Artifacts

- [SentinelOne App Control Evidence](../../5_Artifacts/Evidence/EVD-sentinelone-app-control.md)
- [AWS Config Compliance Evidence](../../5_Artifacts/Evidence/EVD-aws-config-compliance.md)
