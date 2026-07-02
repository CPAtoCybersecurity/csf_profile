# RS.MA-02: Incident Report Triage and Validation — Q1 2026 Observation

**Assessment:** 2026 Alma Security CSF Assessment

**Assessor:** Steve Mercer, Internal Audit <steve.mercer@almasecurity.com>

**Observation Date:** 2026-03-15

**Testing Status:** Complete

---

## Testing Methods

| Method | Performed | Notes |
|--------|-----------|-------|
| Examine | Yes | Reviewed ServiceNow incident triage workflow, SOC triage runbook, GuardDuty finding classification and false positive management, incident severity estimation criteria |
| Interview | Yes | Interviewed Nadia Khan on triage quality assurance and validation standards; SOC analyst on daily triage workflow and severity estimation process |
| Test | Yes | Reviewed 5 recent incident reports for triage documentation and severity estimation accuracy; tested triage workflow for consistency across different finding types |

---

## Findings

Alma Security triages incident reports through a structured ServiceNow workflow where SOC analysts perform preliminary review to confirm reports are cybersecurity-related and require investigation. GuardDuty findings arrive pre-classified by severity (Low/Medium/High), providing an initial estimate that analysts validate and adjust based on contextual factors. The SOC triage runbook defines severity estimation criteria including asset sensitivity, data exposure potential, and business impact indicators.

Review of 5 recent incident reports showed consistent preliminary triage with appropriate cybersecurity relevance determination. Severity estimation accuracy was reasonable, though analysts occasionally adjusted initial GuardDuty severity ratings up or down based on organizational context. The triage process averages 30 minutes for initial validation during business hours, extending to 2-4 hours during after-hours on-call response. The SOC handles approximately 15-20 findings per week requiring triage, of which 3-5 are escalated to incident status.

### Strengths

- Structured ServiceNow triage workflow with documented preliminary review steps
- GuardDuty pre-classification provides automated initial severity estimation
- SOC triage runbook defines clear severity estimation criteria
- Analysts demonstrate contextual judgment in adjusting vendor severity ratings
- Manageable triage volume enables thorough preliminary review

### Gaps

- After-hours triage response time (2-4 hours) significantly slower than business hours (30 minutes)
- No formal triage quality review or calibration process across analysts
- Triage metrics (volume, accuracy, time-to-triage) not systematically tracked
- No automated pre-triage enrichment to accelerate analyst review

---

## Score

| Metric | Value |
|--------|-------|
| Actual Score | 4 |
| Target Score | 5 |

**Scoring rationale:** Triage rates a 4, in the Some Security band: the process runs regularly and well during business hours — all 5 sampled reports showed consistent preliminary review, analysts sensibly adjust GuardDuty's pre-classified severities using the runbook's criteria, and the 15–20 findings per week are validated in about 30 minutes each. The material weakness is coverage: after-hours triage stretches to 2–4 hours (four to eight times the daytime figure), and with no calibration process or tracked metrics there is no way to show severity estimation stays accurate across analysts and shifts. What separates this from Minimally Acceptable (5.0) is precisely that gap — consistent execution across the full 24-hour scope with the after-hours deviation known, measured, and treated rather than merely observed.

---

## Evidence Reviewed

- ServiceNow incident triage workflow configuration
- SOC triage runbook with severity estimation criteria
- 5 recent incident report triage documentation
- GuardDuty finding severity classification records
- SOC workload volume analysis (30 days)
- After-hours triage response time samples

---

## Recommendations

| # | Recommendation | Priority | Owner |
|---|----------------|----------|-------|
| 1 | Implement automated pre-triage enrichment (asset context, threat intel, historical similar findings) to reduce triage time | High | Nadia Khan |
| 2 | Establish triage metrics dashboard tracking volume, time-to-triage, and severity accuracy | Medium | Nadia Khan |
| 3 | Conduct quarterly triage calibration exercises to ensure consistency across analysts | Medium | Nadia Khan |
| 4 | Evaluate options to reduce after-hours triage gap (extended coverage or automated triage for common patterns) | Medium | Nadia Khan |

## Related

- **Test Procedure:** [RS.MA-02 Test Procedures](../../3_Test_Procedures/RS/RS.MA-02.md)
- **Controls:** [RS.MA-02_Ex1](../../2_Controls/RS/RS.MA-02_Ex1.md), [RS.MA-02_Ex2](../../2_Controls/RS/RS.MA-02_Ex2.md)
