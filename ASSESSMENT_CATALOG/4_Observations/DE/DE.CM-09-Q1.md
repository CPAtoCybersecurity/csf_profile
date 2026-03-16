# DE.CM-09: Computing Hardware and Software Monitoring — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed SentinelOne endpoint monitoring configuration, AWS Config compliance rules, GuardDuty malware detection settings, vulnerability scan reports, email/web filtering configuration |
| Interview | Yes | Interviewed Nadia Khan on endpoint and workload monitoring strategy; IT Manager on patch compliance monitoring and software baseline enforcement |
| Test | Yes | Verified SentinelOne agent deployment coverage; tested AWS Config compliance rule evaluation for security group and encryption baselines; reviewed most recent vulnerability scan findings |

---

## Findings

Alma Security monitors computing hardware and software through SentinelOne endpoint detection and response (EDR) deployed across all managed endpoints, AWS Config for cloud resource configuration compliance monitoring, and GuardDuty for runtime workload threat detection. SentinelOne provides continuous monitoring for malware, ransomware, unauthorized process execution, and behavioral anomalies on Windows and macOS endpoints.

AWS Config evaluates cloud resource configurations against defined compliance rules, flagging deviations such as unencrypted S3 buckets, overly permissive security groups, and missing logging configurations. Vulnerability scanning runs monthly through the established scanning tool, producing the Vulnerability Scan Summary report. SentinelOne agent coverage is at 95% of managed endpoints, with 3 legacy systems lacking agent support identified in the coverage gap analysis.

Email filtering and web content filtering provide monitoring of common attack vectors, though advanced sandboxing or detonation capabilities are not deployed. Software configuration baseline monitoring relies on AWS Config for cloud resources but lacks equivalent enforcement for on-premises systems beyond SentinelOne application control.

### Strengths

- SentinelOne EDR deployed on 95% of managed endpoints with behavioral analysis
- AWS Config provides continuous cloud configuration compliance monitoring
- Monthly vulnerability scans with documented findings and remediation tracking
- GuardDuty provides runtime threat detection for AWS workloads
- SentinelOne application control monitors for unauthorized software execution

### Gaps

- 3 legacy endpoints lack SentinelOne agent coverage due to OS compatibility
- No advanced email sandboxing or detonation for zero-day attachment analysis
- On-premises software configuration baseline enforcement limited to SentinelOne application control
- Hardware tamper detection not implemented for on-premises equipment
- Patch compliance monitoring is monthly rather than continuous

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

---

## Evidence Reviewed

- SentinelOne deployment coverage report and gap analysis
- AWS Config compliance rule evaluation results
- GuardDuty runtime monitoring configuration
- Vulnerability Scan Summary report (Q1 2026)
- Email and web content filtering configuration
- SentinelOne application control policy settings
- Legacy endpoint compatibility assessment

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Remediate 3 legacy endpoint coverage gaps through OS upgrade or compensating controls | High | Nadia Khan |
| 2 | Deploy email sandboxing capability for advanced attachment and URL analysis | High | Nadia Khan |
| 3 | Implement continuous patch compliance monitoring rather than monthly scanning | Medium | Nadia Khan |
| 4 | Establish on-premises software configuration baselines with automated drift detection | Medium | Nadia Khan |
