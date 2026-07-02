# RS.MA-04: Incident Escalation and Elevation — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook escalation criteria and procedures, ServiceNow escalation workflow configuration, executive notification procedures, third-party escalation thresholds |
| Interview | Yes | Interviewed Nadia Khan on escalation decision criteria and coordination with external stakeholders; Gerry (CISO) on executive escalation triggers and board notification thresholds |
| Test | Yes | Traced escalation path for 2 recent incidents; verified ServiceNow escalation timer configuration; validated on-call escalation chain responsiveness |

---

## Findings

The incident response playbook defines escalation criteria based on incident severity, scope expansion, containment failure, and time-based triggers. ServiceNow incident tickets include escalation timers that trigger notification to the next level if resolution milestones are not met within defined windows. Nadia Khan serves as the primary escalation point for the D&R team, with the CISO (Gerry) as the executive escalation authority for major incidents.

External escalation procedures include the third-party DFIR retainer activation threshold, law enforcement engagement criteria, and regulatory notification triggers. Review of 2 recent incidents showed appropriate escalation decisions, with one incident correctly escalated from the SOC analyst to Nadia Khan based on scope expansion. Ongoing incident status tracking occurs through ServiceNow dashboards, though real-time status is communicated primarily through Slack rather than the formal tracking system.

### Strengths

- Escalation criteria documented with clear triggers for severity, scope, containment failure, and time-based thresholds
- ServiceNow escalation timers automate notification for missed resolution milestones
- Clear escalation chain from SOC analyst to D&R lead (Nadia Khan) to CISO (Gerry)
- External escalation thresholds defined for DFIR retainer, law enforcement, and regulators
- Recent incidents demonstrate appropriate escalation decision-making

### Gaps

- Real-time incident status primarily communicated via Slack rather than formal tracking system
- No automated escalation based on IOC sweep results or scope expansion detection
- Escalation effectiveness metrics not tracked (time-to-escalate, escalation accuracy)
- Cross-functional stakeholder escalation (legal, communications, HR) coordination procedures underdeveloped

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

**Scoring rationale:** Escalation scores 4, in the Some Security band: criteria are documented across four trigger types (severity, scope expansion, containment failure, time), ServiceNow escalation timers automatically notify on missed milestones, and both traced incidents showed sound judgment — including one correctly elevated from the SOC analyst to Nadia Khan on scope expansion. The material weaknesses are evidential and procedural: real-time incident status lives in Slack rather than the system of record, so the formal trail is incomplete; escalation effectiveness is unmeasured (no time-to-escalate or accuracy tracking); and cross-functional escalation to legal, communications, and HR remains underdeveloped. To reach Minimally Acceptable (5.0), the escalation record must be consistently complete in ServiceNow across all incidents — a control whose evidence partially resides in an informal channel cannot yet demonstrate consistent full-scope execution.

---

## Evidence Reviewed

- Incident response playbook escalation criteria and procedures
- ServiceNow escalation timer configuration and notification rules
- 2 incident tickets with escalation history
- Executive notification procedures and thresholds
- Third-party DFIR retainer escalation triggers
- On-call escalation chain documentation

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Migrate real-time incident status tracking from Slack to ServiceNow to maintain single source of truth | High | Nadia Khan |
| 2 | Develop cross-functional escalation procedures for legal, communications, and HR engagement | Medium | Nadia Khan |
| 3 | Implement escalation effectiveness metrics (time-to-escalate, escalation accuracy) | Medium | Nadia Khan |
| 4 | Add automated escalation triggers based on IOC sweep results indicating scope expansion | Low | Nadia Khan |

## Related

- **Test Procedure:** [RS.MA-04 Test Procedures](../../3_Test_Procedures/RS/RS.MA-04.md)
- **Controls:** [RS.MA-04_Ex1](../../2_Controls/RS/RS.MA-04_Ex1.md), [RS.MA-04_Ex2](../../2_Controls/RS/RS.MA-04_Ex2.md)
