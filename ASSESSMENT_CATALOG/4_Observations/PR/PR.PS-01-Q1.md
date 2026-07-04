# PR.PS-01: Configuration Management Practices - Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed Ansible playbooks, Terraform modules, AWS Config rules, and CIS Benchmark-derived baseline documentation |
| Interview | Yes | Interviewed Chris Magann (configuration management owner) and Tigan Wang (infrastructure/platform lead) |
| Test | Yes | Sampled 15 systems across Amazon Linux 2, Ubuntu, and Kubernetes nodes; validated configurations against baselines using AWS Config compliance data |

---

## Findings

### Strengths

- Hardened baselines derived from CIS Benchmarks are documented and codified as infrastructure-as-code (Ansible playbooks and Terraform modules), providing repeatable and auditable configuration enforcement
- 95% of production systems are running on hardened baselines, demonstrating strong deployment coverage
- AWS Config provides continuous compliance monitoring with 47 custom and managed rules mapped to baseline standards
- Deviation alerting is operational with tiered routing: PagerDuty for critical deviations, Slack for high severity, weekly digest for medium/low
- Infrastructure-as-code approach ensures new systems inherit hardened configurations at provisioning time

### Gaps

- 5% of systems (legacy development environments) are not on hardened baselines and operate without equivalent configuration enforcement
- Kubernetes node baselines have not been independently validated against the CIS Kubernetes Benchmark (kube-bench not deployed)
- On-premises Windows domain controller configurations are managed separately from the IaC workflow and lack equivalent automated compliance monitoring
- Baseline review cadence is ad hoc rather than formally scheduled; no evidence of periodic review aligned with CIS Benchmark update cycles
- Auto-remediation coverage is limited to approximately 30% of AWS Config rules; the majority of deviations require manual remediation

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 5 |
| Target Score | 6 |

**Scoring rationale:** Configuration management earns a 5 — Minimally Acceptable — because the control executes consistently across essentially its full scope with minor, known flaws: CIS-derived baselines are codified as Ansible and Terraform IaC, 95% of production systems run hardened, 47 AWS Config rules monitor continuously, and deviations route through tiered PagerDuty/Slack alerting with remediation tickets (7 examples reviewed). The remaining 5% of legacy dev systems and the separately-managed Windows DC are known exceptions rather than silent gaps. What separates the score from Optimized (6.0) is disciplined measurement and drift response: baseline reviews are ad hoc rather than scheduled against CIS release cycles, Kubernetes nodes have never been validated with kube-bench, and auto-remediation covers only ~30% of rules, so the owner is not yet systematically acting on drift.

---

## Evidence Reviewed

- CIS Benchmark-derived baseline documentation (Confluence)
- Ansible hardening playbooks (GitLab IaC repository)
- Terraform hardened AMI provisioning modules (GitLab IaC repository)
- AWS Config compliance dashboard showing 95% compliance rate
- AWS Config rules inventory (47 rules)
- Deviation alert configuration (PagerDuty, SNS, Slack)
- Sample deviation alerts and remediation tickets (7 examples reviewed)
- Infrastructure change management records in ServiceNow

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Migrate remaining 5% of systems to hardened baselines or decommission legacy dev environments | High | Chris Magann |
| 2 | Deploy kube-bench for CIS Kubernetes Benchmark validation on EKS nodes | High | Tigan Wang |
| 3 | Implement equivalent automated compliance monitoring for on-premises Windows DC (DSC or SCAP) | Medium | Chris Magann |
| 4 | Establish quarterly baseline review cadence aligned to CIS Benchmark release cycle | Medium | Chris Magann |
| 5 | Expand AWS Config auto-remediation coverage from 30% to 60%+ of rules | Medium | Tigan Wang |

## Related

- **Test Procedure:** [PR.PS-01 Test Procedures](../../3_Test_Procedures/PR/PR.PS-01.md)
- **Controls:** [PR.PS-01_Ex1](../../2_Controls/PR/PR.PS-01_Ex1.md), [PR.PS-01_Ex2](../../2_Controls/PR/PR.PS-01_Ex2.md), [PR.PS-01_Ex3](../../2_Controls/PR/PR.PS-01_Ex3.md)
