# PR.DS-01: Data-at-Rest Protection -- Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed encryption configurations across AWS (S3, RDS, EBS, KMS), on-premises BitLocker settings, and Kubernetes PV encryption. Examined data encryption policy and removable media policy documentation. |
| Interview | Yes | Interviewed Chris Magann (encryption project lead) on Data Encryption Upgrade status, Nadia Khan on DLP monitoring coverage, and Tigan Wang on infrastructure encryption implementation. |
| Test | Yes | Verified S3 bucket encryption settings across sample of 15 buckets, tested SentinelOne device control blocking of USB media, validated RDS encryption status, and confirmed KMS key rotation configuration. |

---

## Findings

### Strengths

- AES-256 encryption standard is defined and being systematically deployed across all storage platforms through two dedicated projects (Data Encryption Upgrade $95K, S3 Bucket Security $70K)
- AWS RDS PostgreSQL encryption at rest is enabled on all production instances using KMS customer-managed keys
- SentinelOne removable media controls are fully deployed across the 300-person endpoint fleet with a documented exception process and weekly DLP log review
- Biometric data receives application-level encryption before storage, providing defense-in-depth beyond infrastructure encryption
- KMS key rotation is configured on a 365-day cycle with CloudTrail audit logging of all key usage
- BitLocker encryption is enabled on on-premises Windows Domain Controller servers

### Gaps

- S3 bucket encryption migration from SSE-S3 to SSE-KMS (customer-managed keys) is approximately 60% complete; remaining buckets have less granular key management control
- Data classification schema is still in development, meaning encryption requirements cannot be fully mapped to data sensitivity levels
- No centralized encryption compliance dashboard spanning both cloud and on-premises environments, limiting cross-environment visibility
- File integrity monitoring via SentinelOne has coverage gaps on some Kubernetes worker nodes
- Key rotation cycle of 365 days may be insufficient for keys protecting biometric data (highest sensitivity)
- Proactive data integrity validation program is not yet established; reliance on reactive FIM monitoring only
- On-premises encryption compliance is not centrally reported, requiring manual verification

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 6 |

---

## Evidence Reviewed

- AWS KMS key inventory and encryption policy documentation
- S3 bucket encryption configuration report (15-bucket sample showing 9 SSE-KMS, 6 SSE-S3)
- RDS encryption status for all PostgreSQL production instances (all encrypted)
- Data Encryption Upgrade project plan and status report (Jira ENCRYPT-2026)
- S3 Bucket Security project remediation tracker (Jira S3SEC-2026)
- SentinelOne device control policy configuration and block rate report
- Removable media exception log (3 approved exceptions in Q1 2026)
- BitLocker encryption status report for on-premises servers
- SentinelOne FIM policy configuration and alert samples
- KMS key rotation configuration and CloudTrail key usage logs

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Complete S3 bucket migration to SSE-KMS customer-managed keys across all buckets | High | Chris Magann |
| 2 | Complete data classification schema to drive encryption requirements by sensitivity level | High | Chris Magann |
| 3 | Evaluate 90-day key rotation for KMS keys protecting biometric data | Medium | Chris Magann |
| 4 | Deploy centralized encryption compliance dashboard covering cloud and on-premises | Medium | Tigan Wang |
| 5 | Extend SentinelOne FIM coverage to all Kubernetes worker nodes | Medium | Tigan Wang |
| 6 | Establish quarterly proactive data integrity validation program for critical data stores | Medium | Nadia Khan |
| 7 | Implement centralized BitLocker compliance reporting for on-premises infrastructure | Low | Tigan Wang |
