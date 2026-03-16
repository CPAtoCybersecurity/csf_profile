# RC.RP-05: Verify Restored Asset Integrity — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed backup and restore procedure, quarterly restore test results, post-restoration verification steps, Kubernetes and AWS health check configurations |
| Interview | Yes | Interviewed engineering lead on post-restoration verification practices, 2024 incident restoration validation, and production cutover criteria |
| Test | Partial | Reviewed quarterly restore test evidence of integrity verification; independent post-restoration testing not performed this quarter |

---

## Findings

### Strengths

- Quarterly restore tests verify PostgreSQL data integrity and application functionality in isolated environments before production deployment
- Automated backup verification confirms data integrity prior to restoration attempts
- Kubernetes pod health checks and AWS resource monitoring provide automated verification of restored infrastructure
- 2024 incident recovery included root cause remediation verification before service restoration

### Gaps

- **No formal IOC scanning post-restoration** — Restored assets are not scanned for indicators of compromise as a documented step in the recovery procedure
- **End-to-end functional testing not automated** — Post-restoration testing of the continuous authentication service relies on manual verification rather than automated end-to-end tests
- **No defined stabilization period** — There is no documented observation period between restoration completion and full operational declaration
- **Security control validation not explicit** — Post-restoration verification does not include an explicit checklist for confirming security controls (access controls, encryption, logging) are operational

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3.5 |
| Target Score | 5 |

---

## Evidence Reviewed

- Backup and restore procedure documentation
- Quarterly restore test results (Q4 2025, Q1 2026)
- PostgreSQL data integrity validation logs
- Kubernetes pod health check configuration
- AWS CloudWatch monitoring configuration
- 2024 incident restoration verification evidence

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Add IOC scanning as a required step in the post-restoration procedure before returning systems to production | High | Tigan Wang |
| 2 | Develop automated end-to-end functional tests for the continuous authentication service that run after restoration | Medium | Tigan Wang |
| 3 | Define a post-restoration stabilization observation period with monitoring criteria before declaring normal operations | Medium | Tigan Wang |
| 4 | Create a post-restoration security control validation checklist covering access controls, encryption, and logging | Medium | Nadia Khan |
