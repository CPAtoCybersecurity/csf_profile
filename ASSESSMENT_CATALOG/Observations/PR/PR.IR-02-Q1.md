# PR.IR-02: Environmental Threat Protection — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF 2.0 Profile Assessment

**Assessor:** Steve <steve@almasecurity.com>

**Observation Date:** 2026-03-14

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed fire suppression documentation, HVAC monitoring configuration, AWS multi-AZ deployment architecture |
| Interview | Yes | Interviewed infrastructure lead on Redwood City DC environmental controls, maintenance schedules, and AWS shared responsibility understanding |
| Test | No | Physical inspection of data center environmental systems not performed; relied on documentation review |

---

## Findings

### Strengths

- Fire suppression system is deployed in the Redwood City data center, providing automated detection and suppression
- HVAC monitoring is active with alerting configured for temperature and humidity deviations
- AWS multi-AZ production architecture provides inherent environmental resilience through geographic distribution of availability zones
- Infrastructure team demonstrates understanding of the AWS shared responsibility model for physical and environmental controls

### Gaps

- **No formal environmental risk assessment** — Environmental threats to the Redwood City facility have not been systematically identified and documented
- **Fire suppression inspection records not reviewed** — Cannot independently confirm testing cadence, last inspection date, or system reliability
- **Flood detection uncertain** — Presence of water intrusion sensors in the data center has not been confirmed, relevant given Northern California flood risk
- **UPS capacity and testing undocumented** — Battery replacement schedule, load testing cadence, and capacity relative to current equipment load are not documented
- **No environmental trend reporting** — HVAC monitoring captures events but trends are not analyzed to identify gradual degradation or capacity concerns
- **Environmental monitoring not linked to IT incident management** — Environmental alerts may not trigger appropriate IT response procedures

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4.5 |
| Target Score | 6 |

---

## Evidence Reviewed

- Fire suppression system documentation for Redwood City data center
- HVAC monitoring system configuration and alert thresholds
- AWS multi-AZ deployment architecture documentation
- AWS shared responsibility model documentation
- UPS configuration records (limited)
- Building management system dashboard screenshots

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|---------------|----------|-------|
| 1 | Conduct a formal environmental risk assessment for the Redwood City data center facility | Medium | Tigan Wang |
| 2 | Obtain and review fire suppression inspection records; establish an annual review cycle | Medium | Tigan Wang |
| 3 | Verify flood/water detection sensor deployment or install sensors in the data center | Medium | Tigan Wang |
| 4 | Document UPS capacity, battery replacement schedule, and establish load testing cadence | Medium | Tigan Wang |
| 5 | Implement monthly environmental trend reporting from HVAC monitoring data | Low | Tigan Wang |
| 6 | Create escalation procedures linking environmental monitoring alerts to IT incident management | Medium | Tigan Wang |
