# PR.PS-04_Ex1: Define Logging Requirements by System Type

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-01 (Policy and Procedures), AU-02 (Event Logging), AU-03 (Content of Audit Records)

## Implementation Example

> Define and document logging requirements for each system type, specifying what events must be logged, the content and format of log records, and retention periods aligned with regulatory and operational needs.

## Alma Security Implementation

Alma Security has defined logging requirements through its Logging and Monitoring Policy, which specifies event categories that must be logged across different system types. The policy mandates logging of authentication events (success and failure), authorization decisions, administrative actions, configuration changes, data access events for sensitive data stores, system errors and exceptions, and network connection events. Log record content requirements include timestamp (UTC), source system identifier, user or service identity, event type, outcome (success/failure), and source IP address.

Retention periods are defined by log category: security logs are retained for 12 months online and 24 months in archive storage, operational logs for 6 months, and debug/application logs for 30 days. These retention periods are aligned with Alma's SOC 2 requirements and incident investigation needs. Cloud-native logging services are configured with retention policies that match these requirements: CloudTrail logs are retained in S3 with lifecycle policies, VPC Flow Logs are retained for 12 months, and EKS audit logs are retained for 90 days in CloudWatch with archival to S3 for the remainder of the retention period.

However, the logging policy has gaps in specificity. While it defines what event categories must be logged, it does not provide system-specific logging configuration standards (e.g., specific Windows event IDs, specific Linux auditd rules, specific Kubernetes audit policy levels). The implementation of the policy varies by platform, with AWS-native services having strong logging coverage while on-premises systems and application-layer logging are less consistently configured.

## Evidence of Implementation

| Evidence | Location/Source | Last Verified |
|----------|----------------|---------------|
| Logging and Monitoring Policy | Confluence policy repository | 2026-02-15 |
| CloudTrail configuration and retention settings | AWS Console | 2026-03-14 |
| VPC Flow Logs configuration | AWS VPC Console | 2026-03-14 |
| EKS audit log configuration and retention | AWS EKS / CloudWatch | 2026-03-14 |
| S3 lifecycle policies for log archival | AWS S3 Console | 2026-03-10 |

## Maturity Assessment

| Quarter | Actual | Target | Status |
|---------|--------|--------|--------|
| Q1 2026 | 4 | 6 | On Track |

## Gaps & Remediation

| Gap | Impact | Remediation | Owner | Due Date |
|-----|--------|-------------|-------|----------|
| Logging policy lacks platform-specific configuration standards | Medium --- inconsistent logging implementation across platforms | Develop platform-specific logging standards (Linux auditd, Windows Event Log, K8s audit policy) | Nadia Khan | Q2 2026 |
| Application-layer logging requirements not well-defined | Medium --- gaps in application event logging for security-relevant actions | Define application logging standards with development team; integrate into secure SDLC | Nadia Khan | Q3 2026 |
| On-premises Windows DC logging configuration not aligned to policy | Medium --- potential gaps in authentication and authorization event logging | Audit Windows DC logging configuration against NIST SP 800-92 recommendations | Chris Magann | Q2 2026 |
