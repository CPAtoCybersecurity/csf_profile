# RS.CO-02: Stakeholder Incident Notification — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook notification procedures, breach notification regulatory requirements matrix, contractual notification obligations, Slack #security-alerts notification history |
| Interview | Yes | Interviewed Nadia Khan on stakeholder notification workflow and decision criteria; Gerry (CISO) on executive and regulatory notification authority |
| Test | Yes | Traced notification workflow for 2 recent incidents to verify stakeholder notification compliance; reviewed breach notification procedure against applicable regulatory requirements |

---

## Findings

The incident response playbook defines stakeholder notification procedures for internal and external parties. Internal notification flows through Slack #security-alerts for the security team and escalates to executive leadership via direct communication for major incidents. The CISO (Gerry) is the designated authority for external notifications to regulators, law enforcement, and affected customers.

Breach notification procedures reference applicable regulatory requirements, and contractual notification obligations are documented for key business partners and customers. Review of 2 recent incidents confirmed that internal stakeholder notification followed the playbook procedures. However, the organization has not conducted a tabletop exercise specifically testing the external breach notification workflow end-to-end, including regulatory filing, customer communication, and law enforcement engagement. Notification timelines and templates for different regulatory jurisdictions are documented but have not been validated through simulation.

### Strengths

- Stakeholder notification procedures documented in the incident response playbook with clear escalation paths
- Slack #security-alerts provides rapid internal security team notification
- CISO designated as breach notification authority with documented decision criteria
- Contractual notification obligations tracked for key business relationships
- Regulatory notification requirements cataloged by jurisdiction

### Gaps

- No tabletop exercise validating the external breach notification workflow end-to-end
- Notification templates not tested through simulation
- No automated tracking of notification compliance timelines
- Customer notification distribution mechanism not pre-staged for rapid deployment

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

**Scoring rationale:** The 4 lands in the Some Security band because only half the control's scope has execution evidence: internal notification works — both incidents traced during fieldwork followed the playbook, flowing through Slack #security-alerts with executive escalation, and the CISO's external-notification authority, jurisdiction-by-jurisdiction regulatory matrix, and contractual obligations are all documented. The material weakness is the external half: the end-to-end breach notification workflow (regulatory filing, customer communication, law enforcement engagement) has never been exercised, even in tabletop form, and the templates remain unvalidated. Minimally Acceptable (5.0) demands consistent execution across the full scope, and a notification capability that exists only on paper for its highest-stakes path — with no compliance-timeline tracking and no pre-staged customer distribution mechanism — cannot yet demonstrate that.

---

## Evidence Reviewed

- Incident response playbook notification procedures
- Breach notification regulatory requirements matrix
- Contractual notification obligations for key partners
- Slack #security-alerts notification history for 2 incidents
- Executive escalation communication records
- Notification timeline requirements by jurisdiction

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Conduct tabletop exercise testing external breach notification workflow including regulatory filing and customer communication | High | Nadia Khan |
| 2 | Pre-stage customer notification distribution mechanism for rapid deployment during breach | Medium | Nadia Khan |
| 3 | Implement automated notification compliance timeline tracking in ServiceNow | Medium | Nadia Khan |
| 4 | Validate notification templates through legal review annually | Low | Gerry |

## Related

- **Test Procedure:** [RS.CO-02 Test Procedures](../../3_Test_Procedures/RS/RS.CO-02.md)
- **Controls:** [RS.CO-02_Ex1](../../2_Controls/RS/RS.CO-02_Ex1.md), [RS.CO-02_Ex2](../../2_Controls/RS/RS.CO-02_Ex2.md), [RS.CO-02_Ex3](../../2_Controls/RS/RS.CO-02_Ex3.md)
