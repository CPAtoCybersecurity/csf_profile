# RC.CO-03: Communicate Recovery Activities and Progress — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-16

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook communication procedures, Slack channel configuration for recovery coordination, stakeholder notification documentation, 2024 incident communication records |
| Interview | Yes | Interviewed engineering leadership on recovery communication practices, stakeholder notification process, and supplier coordination during incidents |
| Test | No | Recovery communication procedures have not been rehearsed or tested through tabletop exercises |

---

## Findings

### Strengths

- Incident communication procedures are documented in the incident response playbook, providing a foundation for recovery communication
- Stakeholder communication during recovery uses Slack and direct channels, with defined internal notification paths
- The 2024 security incidents demonstrated functional recovery communication with stakeholders, providing real-world execution evidence
- Trust-rebuilding initiatives following 2024 incidents reflect organizational awareness of communication importance during recovery

### Gaps

- **Communication procedures not rehearsed** — Recovery communication procedures have not been tested through tabletop exercises or communication drills, creating execution risk during high-stress incidents
- **No formal communication cadence** — Recovery status update frequency is ad hoc rather than defined at regular intervals for different stakeholder groups
- **Supplier communication not formalized** — Crisis communication procedures for coordinating with critical suppliers (AWS, SaaS vendors) are not documented
- **Slack channel access controls not reviewed** — Recovery communication channels have not been formally reviewed for appropriate access controls and information security
- **No contractual obligation register** — Information-sharing requirements from customer and vendor contracts are not consolidated into a reference register for recovery communication

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3.5 |
| Target Score | 5 |

**Scoring rationale:** The 3.5 places recovery communication in the Some Security band (2.0–4.9): communication procedures are documented in the incident response playbook and the 2024 incidents produced real execution evidence, but reliability between the rubric's 3 (defined, unreliably executed) and 4 (regular, with material weaknesses) anchors is the honest read. Execution has never been rehearsed through a tabletop or communication drill, status-update cadence is ad hoc rather than defined per stakeholder group, and supplier coordination procedures for AWS and key SaaS vendors are undocumented. Reaching the Minimally Acceptable band at the target of 5 would require consistent execution across the full communication scope — including a rehearsed cadence, formalized supplier procedures, and a contractual information-sharing obligation register — with exceptions known and tracked, none of which exists today.

---

## Evidence Reviewed

- Incident response playbook (communication procedures section)
- Slack channel configuration for incident and recovery communication
- 2024 security incident communication records
- Stakeholder notification contact lists
- Third-party vendor agreements (communication provisions)
- Trust-rebuilding initiative documentation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Conduct a tabletop exercise focused on recovery communication, testing notification procedures and stakeholder update cadence | High | Nadia Khan |
| 2 | Define a recovery communication cadence matrix specifying update frequency by stakeholder group and incident severity | Medium | Tigan Wang |
| 3 | Document crisis communication procedures for critical supplier coordination, including AWS and key SaaS vendors | Medium | Tigan Wang |
| 4 | Review and formalize Slack channel access controls for recovery communication channels | Low | Tigan Wang |
| 5 | Compile a contractual information-sharing obligation register for use during recovery communications | Medium | Nadia Khan |

## Related

- **Test Procedure:** [RC.CO-03 Test Procedures](../../3_Test_Procedures/RC/RC.CO-03.md)
- **Controls:** [RC.CO-03_Ex1](../../2_Controls/RC/RC.CO-03_Ex1.md), [RC.CO-03_Ex2](../../2_Controls/RC/RC.CO-03_Ex2.md), [RC.CO-03_Ex3](../../2_Controls/RC/RC.CO-03_Ex3.md), [RC.CO-03_Ex4](../../2_Controls/RC/RC.CO-03_Ex4.md)
