# DE.CM-02: Physical Environment Monitoring — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed physical access control system logs, badge reader configuration, visitor registration procedures, office security camera coverage documentation |
| Interview | Yes | Interviewed facilities manager on physical access monitoring procedures; Nadia Khan on integration between physical and logical security monitoring |
| Test | Yes | Reviewed 30 days of badge reader logs for anomalous access patterns; verified visitor sign-in records against badge issuance; tested after-hours access alert generation |

---

## Findings

Alma Security monitors the physical environment through badge reader access controls at the corporate office, security cameras at building entry points, and a visitor registration system requiring sign-in and escort assignment. Badge reader logs are retained for 90 days and reviewed monthly by the facilities team for anomalous patterns.

Physical environment monitoring is limited in scope given Alma's cloud-first infrastructure model -- primary computing resources reside in AWS rather than on-premises data centers. The corporate office houses the Windows Domain Controller and employee workstations but no production servers. After-hours badge access generates alerts to the facilities manager but not to the security team. There is no integration between physical access logs and logical access monitoring, meaning a compromised badge would not trigger correlation with network authentication events.

### Strengths

- Badge reader access controls operational at all corporate office entry points
- Security cameras cover building entrances with 30-day footage retention
- Visitor registration requires sign-in and escort assignment
- Monthly badge access log review by facilities team

### Gaps

- After-hours physical access alerts route to facilities only, not to security team
- No integration between physical access logs and logical security monitoring
- Physical access anomaly detection is manual and monthly, not real-time
- No tamper detection on physical access control hardware

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 3 |
| Target Score | 4 |

**Scoring rationale:** The score of 3 sits in the **Some Security** band (2.0–4.9): a defined process exists — badge readers at all entry points, 90-day log retention, and a monthly facilities review — but execution is unreliable as a *detection* control because after-hours access alerts route only to the facilities manager, never reaching the security team, and physical logs are not correlated with logical authentication events. A monthly manual review cannot catch a compromised badge in anything close to real time. Moving up within the band toward the target of 4 (also Some Security) requires the security-team alert routing and SIEM integration to make the review cycle dependable; a 5 (Minimally Acceptable) would further require anomaly detection that operates consistently rather than as a once-a-month lookback.

---

## Evidence Reviewed

- Badge reader access logs (30 days)
- Visitor registration records (Q1 2026)
- Security camera coverage map and retention policy
- After-hours access alert configuration
- Monthly physical access review reports

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Route after-hours physical access alerts to security team in addition to facilities | High | Nadia Khan |
| 2 | Integrate physical access logs with SIEM for correlation with logical access events | Medium | Nadia Khan |
| 3 | Implement real-time anomaly detection for physical access patterns (tailgating, repeated failed badge attempts) | Medium | Nadia Khan |
| 4 | Add tamper detection on badge readers and physical access control panels | Low | Nadia Khan |

## Related

- **Test Procedure:** [DE.CM-02 Test Procedures](../../3_Test_Procedures/DE/DE.CM-02.md)
- **Controls:** [DE.CM-02_Ex1](../../2_Controls/DE/DE.CM-02_Ex1.md), [DE.CM-02_Ex2](../../2_Controls/DE/DE.CM-02_Ex2.md), [DE.CM-02_Ex3](../../2_Controls/DE/DE.CM-02_Ex3.md), [DE.CM-02_Ex4](../../2_Controls/DE/DE.CM-02_Ex4.md)
