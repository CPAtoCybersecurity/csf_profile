# RC.RP-02: Select and Perform Recovery Actions — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook recovery action procedures, quarterly restore test documentation, AWS failover configuration, Kubernetes recovery mechanisms |
| Interview | Yes | Interviewed engineering lead on recovery action selection during 2024 incidents and current recovery prioritization approach |
| Test | Partial | Reviewed quarterly restore test execution; dedicated recovery action prioritization exercise not performed |

---

## Findings

### Strengths

- Recovery actions leverage multiple proven mechanisms: PostgreSQL automated backup restoration, AWS multi-AZ failover, and Kubernetes pod redeployment
- Quarterly restore tests validate execution of core recovery actions on a regular cadence
- The 2024 security incident recovery demonstrated adaptive recovery action selection when the scope of impact evolved
- The continuous authentication platform is recognized as the highest-priority recovery target

### Gaps

- **No formal recovery prioritization framework** — Recovery actions are selected based on engineering judgment rather than a documented prioritization matrix tied to business impact analysis
- **Limited multi-system recovery coordination** — Procedures for coordinating recovery across multiple interdependent systems are not documented
- **DR plan incomplete** — The Cloud Security Optimization project will formalize recovery action selection criteria, but is not yet delivered
- **Resource constraint planning absent** — No documented approach for adjusting recovery priorities when personnel or infrastructure resources are constrained

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3.5 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook (recovery action procedures)
- Quarterly restore test procedures and results
- PostgreSQL backup restoration runbook
- AWS multi-AZ configuration and failover documentation
- Kubernetes pod restart and redeployment procedures
- 2024 incident recovery action records

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Develop a recovery prioritization matrix that maps systems to business impact and defines recovery sequencing | High | Tigan Wang |
| 2 | Document multi-system recovery coordination procedures addressing interdependencies between AWS, Kubernetes, and PostgreSQL | Medium | Tigan Wang |
| 3 | Include resource constraint scenarios in recovery planning to address degraded recovery capacity | Medium | Tigan Wang |
| 4 | Incorporate recovery action selection criteria into the DR plan deliverable from the Cloud Security Optimization project | High | Tigan Wang |
