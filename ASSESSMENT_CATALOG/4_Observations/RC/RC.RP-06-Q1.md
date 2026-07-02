# RC.RP-06: Declare Recovery End and Document — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed post-incident review documentation from 2024 incidents, incident response playbook closure section, lessons learned records |
| Interview | Yes | Interviewed engineering leadership on post-incident review process, recovery closure practices, and lessons learned integration |
| Test | No | Recovery closure process not independently tested; reviewed historical incident records |

---

## Findings

### Strengths

- Post-incident reviews are conducted following security incidents, capturing incident details, response and recovery actions, and lessons learned
- The 2024 security incident after-action process drove concrete improvements including trust-rebuilding initiatives and procedure updates
- Lessons learned from 2024 incidents were incorporated into updated incident response and recovery procedures
- Recovery completion is communicated to stakeholders through Slack and leadership confirmation

### Gaps

- **Post-incident review process not formalized** — No standard template, required sections, completion timeline, or quality review exists for after-action reports, leading to inconsistency
- **Recovery closure criteria not documented** — The end of recovery is declared through informal leadership sign-off rather than against documented, measurable criteria
- **Lessons learned tracking incomplete** — Lessons learned are captured but not systematically tracked to completion with assigned owners, deadlines, and closure verification
- **No recovery documentation retention policy** — Incident recovery documentation retention requirements are not defined

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 5 |

**Scoring rationale:** The 3 lands in the Some Security band (2.0–4.9) at the rubric's anchor 3: post-incident review is a real, understood practice — the 2024 after-action process demonstrably produced trust-rebuilding initiatives and updated response and recovery procedures — but it runs without a standard template, required sections, completion timeline, or quality review, so consistency depends on who conducts it. Recovery end is declared by informal leadership sign-off rather than against documented, measurable closure criteria, and lessons learned are captured but not tracked to closure with owners and deadlines. Closing the gap to Minimally Acceptable (5.0) requires the closure-and-documentation process to execute the same way every time — formal criteria, a templated after-action report on a deadline, tracked lessons learned, and defined retention — none of which is in place this quarter.

---

## Evidence Reviewed

- 2024 security incident after-action documentation
- Incident response playbook (closure and lessons learned sections)
- Lessons learned records and procedure update evidence
- Trust-rebuilding initiative documentation
- Recovery completion communications (Slack records)

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Formalize the post-incident review process with a standard template, required sections, completion deadline (e.g., 14 days post-recovery), and quality review | High | Nadia Khan |
| 2 | Document measurable recovery closure criteria that must be met before declaring the end of recovery | High | Tigan Wang |
| 3 | Implement a lessons learned tracking system with assigned owners, deadlines, and closure verification | Medium | Nadia Khan |
| 4 | Define retention requirements for incident recovery documentation aligned with regulatory and contractual obligations | Medium | Nadia Khan |

## Related

- **Test Procedure:** [RC.RP-06 Test Procedures](../../3_Test_Procedures/RC/RC.RP-06.md)
- **Controls:** [RC.RP-06_Ex1](../../2_Controls/RC/RC.RP-06_Ex1.md), [RC.RP-06_Ex2](../../2_Controls/RC/RC.RP-06_Ex2.md)
