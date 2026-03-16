# RS.MA-01: Incident Response Plan Execution — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed incident response playbook execution procedures, ServiceNow incident ticket workflow automation, third-party DFIR retainer agreement, GuardDuty auto-detection-to-ticket pipeline |
| Interview | Yes | Interviewed Nadia Khan on incident response activation process and third-party coordination; SOC analyst on detection-to-response workflow and incident lead assignment |
| Test | Yes | Traced 2 recent incidents from detection through response plan activation; verified GuardDuty auto-ticket creation for high-severity findings; validated third-party retainer activation procedures |

---

## Findings

Alma Security's incident response plan execution follows a defined workflow from detection through response activation. GuardDuty high-severity findings automatically create ServiceNow incident tickets, initiating the response process. Nadia Khan or the on-call senior analyst designates an incident lead who coordinates response activities according to the playbook. The organization maintains a third-party DFIR retainer for incidents exceeding internal capacity.

Review of 2 recent incidents confirmed that the response plan was activated within the defined timelines. The phishing incident (TKT-SOC-1001) demonstrated effective plan execution with appropriate incident lead designation, containment actions, and documentation. The third-party DFIR retainer agreement is current and includes defined escalation thresholds. However, tabletop exercises testing response plan execution against complex multi-vector scenarios have not been conducted in the past 12 months. The playbook does not include explicit triggers for activating business continuity or disaster recovery plans as supplementary response actions.

### Strengths

- Automated detection-to-ticket pipeline through GuardDuty-ServiceNow integration ensures rapid response initiation
- Incident lead designation process operational with clear accountability
- Third-party DFIR retainer current and activation procedures documented
- Recent incident execution demonstrated effective playbook adherence

### Gaps

- No tabletop exercise conducted in the past 12 months testing complex multi-vector scenarios
- Playbook lacks explicit triggers for business continuity or disaster recovery plan activation
- No defined process for requesting external incident response assistance at scale
- Response plan execution metrics (time to activate, time to contain) not systematically tracked

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

---

## Evidence Reviewed

- Incident response playbook activation procedures
- ServiceNow incident ticket workflow configuration
- GuardDuty-to-ServiceNow auto-ticket pipeline
- Third-party DFIR retainer agreement and activation procedures
- SOC Ticket TKT-SOC-1001 (phishing incident response trace)
- Incident lead assignment records for 2 recent incidents

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Conduct tabletop exercise testing response plan execution against multi-vector scenario | High | Nadia Khan |
| 2 | Add explicit BC/DR plan activation triggers to the incident response playbook | High | Nadia Khan |
| 3 | Implement response execution KPI tracking (time-to-activate, time-to-contain) in ServiceNow | Medium | Nadia Khan |
| 4 | Document scaled external assistance request procedures for major incidents | Low | Nadia Khan |
