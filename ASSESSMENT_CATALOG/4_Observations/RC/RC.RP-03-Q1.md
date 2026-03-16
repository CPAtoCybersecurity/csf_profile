# RC.RP-03: Verify Backup and Restoration Asset Integrity — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed automated backup verification process, PostgreSQL backup configuration, quarterly restore test procedures and results, AWS backup encryption settings |
| Interview | Yes | Interviewed infrastructure engineer on backup verification automation, integrity checking mechanisms, and quarterly restore test scope |
| Test | Yes | Validated automated backup verification logs and reviewed quarterly restore test evidence confirming data integrity |

---

## Findings

### Strengths

- Automated backup verification runs against PostgreSQL backups and confirms integrity before restoration
- Quarterly restore tests validate backup completeness and data consistency in isolated environments
- AWS-managed backup encryption provides tamper protection at the storage layer
- Backup verification is automated rather than manual, reducing human error in integrity checks

### Gaps

- **No IOC scanning of backup assets** — Backup integrity verification checks for corruption but does not scan for indicators of compromise that could reintroduce threats during restoration
- **Restoration asset inventory incomplete** — Not all restoration assets (Kubernetes manifests, infrastructure-as-code templates, application configuration) are covered by integrity verification
- **No immutable backup copies** — Backups are not stored in an immutable or write-once format to protect against ransomware or insider tampering
- **Verification scope limited to databases** — Automated verification focuses on PostgreSQL backups but does not extend to application-tier backup assets

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- Automated backup verification procedure and logs (90-day sample)
- PostgreSQL backup configuration and scheduling documentation
- Quarterly restore test results with integrity verification details
- AWS backup encryption configuration (S3 server-side encryption, RDS encryption at rest)
- Backup access control configuration

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Add IOC scanning to the backup verification process to detect compromised backup assets before restoration | High | Tigan Wang |
| 2 | Implement immutable backup copies (AWS S3 Object Lock or equivalent) for critical data stores | High | Tigan Wang |
| 3 | Expand backup integrity verification to cover Kubernetes manifests, infrastructure-as-code, and application configuration | Medium | Tigan Wang |
| 4 | Create a comprehensive restoration asset inventory that maps all assets required for full system recovery | Medium | Tigan Wang |
