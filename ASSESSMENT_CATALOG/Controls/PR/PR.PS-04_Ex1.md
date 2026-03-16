# PR.PS-04_Ex1: Define Logging Requirements by System Type

**Subcategory:** PR.PS-04 --- Log records are generated and made available for continuous monitoring

**NIST SP 800-53 Ref:** AU-01 (Policy and Procedures), AU-02 (Event Logging), AU-03 (Content of Audit Records)

## Implementation Example

> Define and document logging requirements for each system type, specifying what events must be logged, the content and format of log records, and retention periods aligned with regulatory and operational needs.

## Alma Security Implementation

Alma's Logging and Monitoring Policy defines required event categories (authentication, authorization, admin actions, config changes, data access) with retention periods of 12 months online / 24 months archive for security logs, aligned to SOC 2 requirements. CloudTrail, VPC Flow Logs, and EKS audit logs are configured with matching retention policies in S3 and CloudWatch. The policy lacks platform-specific configuration standards (e.g., auditd rules, Windows event IDs, K8s audit levels), and on-premises/application-layer logging is less consistently configured.

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
