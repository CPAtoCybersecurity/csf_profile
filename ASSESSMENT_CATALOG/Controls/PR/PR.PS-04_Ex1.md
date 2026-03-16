# PR.PS-04_Ex1: Define Logging Requirements by System Type

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-01 (Policy and Procedures), AU-02 (Event Logging), AU-03 (Content of Audit Records)

## Implementation Example

> Define and document logging requirements for each system type, specifying what events must be logged, the content and format of log records, and retention periods aligned with regulatory and operational needs.

## Alma Security Implementation

Alma's Logging and Monitoring Policy defines required event categories (authentication, authorization, admin actions, config changes, data access) with retention periods of 12 months online / 24 months archive for security logs, aligned to SOC 2 requirements. CloudTrail, VPC Flow Logs, and EKS audit logs are configured with matching retention policies in S3 and CloudWatch. The policy lacks platform-specific configuration standards (e.g., auditd rules, Windows event IDs, K8s audit levels), and on-premises/application-layer logging is less consistently configured.

## Artifacts

- [AWS Config Compliance Evidence](../../Artifacts/Evidence/EVD-aws-config-compliance.md)
- [Vulnerability Scan Summary](../../Artifacts/Reports/RPT-vulnerability-scan-summary.md)
- [Information Security Policy](../../Artifacts/Policies/POL-information-security.md)
