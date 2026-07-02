# RC.RP-04: Establish Post-Incident Operational Norms — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed post-incident documentation from 2024 incidents, KPI tracking dashboards, AWS monitoring configuration, system restoration procedures |
| Interview | Yes | Interviewed engineering leadership on post-incident operational norm establishment, system owner restoration confirmation process, and trust-rebuilding initiatives |
| Test | No | Post-incident norm establishment process not independently tested this quarter |

---

## Findings

### Strengths

- The 2024 security incidents drove establishment of trust-rebuilding initiatives and KPI tracking for the public trust score, demonstrating post-incident operational norm adjustment
- AWS multi-AZ architecture provides infrastructure-level support for maintaining service delivery during post-incident operations
- System owners participate in restoration confirmation through Slack coordination and direct communication
- Post-recovery monitoring using Kubernetes health checks and AWS CloudWatch validates restored system performance

### Gaps

- **No formal RTO/RPO documentation** — Service delivery objectives for the continuous authentication platform and other critical systems are not documented; the DR plan project will address this
- **System owner sign-off not formalized** — Restoration confirmation relies on informal communication rather than documented acceptance criteria and sign-off procedures
- **No post-restoration monitoring enhancement procedure** — Enhanced monitoring during post-recovery stabilization is applied ad hoc rather than following a documented procedure
- **Risk register updates not systematic** — Post-incident risk reassessment occurs but is not systematically linked to risk register entries with tracking and closure

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** The 3 corresponds to the Some Security band (2.0–4.9) and specifically to the rubric's anchor 3: the practice is understood and has been performed — the 2024 incidents produced trust-rebuilding initiatives, a public trust score KPI, and post-recovery monitoring via Kubernetes health checks and CloudWatch — but execution depends on informal mechanisms rather than a reliable defined process. RTO/RPO values are not documented even for the continuous authentication platform, system owner restoration sign-off happens over Slack without acceptance criteria, and post-incident risk register updates are not systematically tracked to closure. What separates this from Minimally Acceptable at the 5.0 target is consistency and documentation: until service delivery objectives, formal sign-off, and a defined post-restoration monitoring procedure exist and operate every time, post-incident norms are re-improvised per incident rather than executed as a control.

---

## Evidence Reviewed

- 2024 security incident after-action documentation
- Public trust score KPI tracking data
- AWS multi-AZ configuration and monitoring dashboards
- Kubernetes health check configuration
- System restoration confirmation communications (Slack records)
- Cloud Security Optimization project charter (DR plan deliverable)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Define and document RTO and RPO values for all critical systems, starting with the continuous authentication platform | High | Tigan Wang |
| 2 | Formalize system owner restoration sign-off with documented acceptance criteria and a sign-off record | Medium | Tigan Wang |
| 3 | Document a post-restoration enhanced monitoring procedure with defined duration, metrics, and escalation thresholds | Medium | Tigan Wang |
| 4 | Establish a systematic process for updating the risk register after incidents, with tracking to closure | Medium | Nadia Khan |

## Related

- **Test Procedure:** [RC.RP-04 Test Procedures](../../3_Test_Procedures/RC/RC.RP-04.md)
- **Controls:** [RC.RP-04_Ex1](../../2_Controls/RC/RC.RP-04_Ex1.md), [RC.RP-04_Ex2](../../2_Controls/RC/RC.RP-04_Ex2.md), [RC.RP-04_Ex3](../../2_Controls/RC/RC.RP-04_Ex3.md)
